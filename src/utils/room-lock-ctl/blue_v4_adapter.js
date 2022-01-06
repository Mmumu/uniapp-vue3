// 以下仅供内部使用
// import * as server from '../../servers.js';
// const DEBUG = true;
// const API_URL = server.baseUrl() + "/api/locksdk/";

// 接入商请使用下面配置
const DEBUG = false
const API_URL = 'https://lock.wangjile.cn/api/locksdk/'

const SPLIT_HEAD = ['a8', 'a7', 'a6']
class BlueV4Adapter {
  constructor(
    params_id,
    token,
    connect_callback,
    auto_command = true,
    timeout = 15
  ) {
    this.auto_command = auto_command
    this.token = token
    this.param_id = params_id
    this.deviceId = ''
    this.retry_connect = 0
    this.post_add_on = {}
    this.writeUuids = []
    this.notifyCallback = null
    this.connect_callback = connect_callback
    this.send_buffer_commands = []
    this.open_door_commands = []
    this.timer = null
    this.auto_retry = true
    this.timeout = timeout * 1000
    this.need_active = true
    this.block_by_open_door_command = false

    this._cdwait = false
    this._cdpackage = 0
    this._cddata = []
    this._cdcharacteristicId = ''
    this.timeStamp = Math.floor(Date.now() / 1000)

    this.blue_tooth_discovery = false
    this.connected = false

    this.open_command_id = ''

    this.activev20 = false
    this.try_to_connect_ble = false
    this.connectBluetooth()
    this.systemInfo = wx.getSystemInfoSync()
  }

  setNeedActive(active) {
    this.need_active = active
  }

  setNotifyCallback(callback) {
    this.notifyCallback = callback
  }

  DetectSys() {
    // 这里原来做的是系统的检测，但是没有什么用
    const res = wx.getSystemInfoSync()
    this.platform = res.platform
    this.systemInfo = res
    return true
  }

  getParamId() {
    return this.param_id
  }

  getDeviceId() {
    return this.deviceId
  }

  openDoor() {
    if (this.connected == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('open')
  }

  reportFoundEvent(result) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_URL + 'found_device',
        data: { result: result, post_add_on: JSON.stringify(this.post_add_on) },
        method: 'POST',
        header: {
          'content-type': 'application/json',
          Authorization: this.token,
        },
        success: (res) => {},
      })
    })
  }

  getOfflinePassword() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_URL + 'offline_password',
        data: { post_add_on: JSON.stringify(this.post_add_on) },
        method: 'POST',
        header: {
          'content-type': 'application/json',
          Authorization: this.token,
        },
        success: (res) => {
          if (res.data.error == 0) {
            resolve({ errcode: 0, password: res.data.password })
          } else {
            reject({ errcode: 1, msg: res.data.msg })
          }
        },
      })
    })
  }

  connectStatus() {
    return this.connected
  }

  forceOpen() {
    if (this.connected == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('force_open')
  }

  stdTime() {
    if (this.connected == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('std_time')
  }

  normallyOpenDoor() {
    if (this.connected == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('open')
  }

  timerRelease() {
    this._ble_discover_timer && clearTimeout(this._ble_discover_timer)
  }

  release() {
    DEBUG && console.log('断开时蓝牙搜索状态：', this.blue_tooth_discovery)
    DEBUG && console.log('断开时蓝牙连接状态：', this.connected)
    this.timerRelease()
    this.connect_callback = null
    if (this.blue_tooth_discovery == true) {
      wx.stopBluetoothDevicesDiscovery()
    }
    if (this.connected == true) {
      wx.closeBLEConnection({
        deviceId: this.deviceId,
        success: (res) => {
          console.log('断开与兰牙连接')
        },
      })
    }
  }
  addData(addon = {}) {
    this.post_add_on = addon
  }

  writeBle(buffer) {
    console.log(buffer, '-------------')
    // 4.0的只有一个写入通道
    if (this.writeUuids.length < 1) {
      console.log('无写入端口')
      return false
    } else {
      console.log('识别到的通道数：', this.writeUuids.length)
    }
    var write_uuid = this.writeUuids[0]
    let { server_id, uuid } = write_uuid
    wx.writeBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: server_id,
      characteristicId: uuid,
      value: buffer,
      success: (res) => {
        DEBUG && console.log('蓝牙写入成功：', server_id, JSON.stringify(res))
      },
      fail: (res) => {
        DEBUG && console.log('蓝牙写入失败：', server_id, JSON.stringify(res))
      },
    })
  }

  _releaseBlock() {
    this.block_by_open_door_command = false
    this.timer = null
    this._send_buffer()
  }

  storeOpenCommandId(command) {
    DEBUG && console.log('发送数据：', command)
    if (command.slice(0, 2) == 'FA') {
      this.open_command_id = command.slice(2, 10).toLowerCase()
      // 锁定其它的指令
      // this.block_by_open_door_command = true
      this.timer = setTimeout(() => this._releaseBlock(), 6000)
      DEBUG && console.log('存储开门指令：' + this.open_command_id)
    }
  }

  _send_buffer() {
    let buffer = null
    let msg = null
    if (this.open_door_commands.length > 0) {
      buffer = this.open_door_commands.shift()
      msg = '发送开门指令==='
    } else if (this.block_by_open_door_command) {
      this.connect_callback &&
        this.connect_callback('block_by_open_door_command 暂不发送')
      DEBUG && console.log('block_by_open_door_command')
      return
    } else {
      buffer = this.send_buffer_commands.shift()
      msg = '发送其它指令'
    }

    if (buffer) {
      this.connect_callback && this.connect_callback(msg)
      this.storeOpenCommandId(buffer)
      this.writeBle(this._hex2ab(buffer))
    } else {
      this.connect_callback && this.connect_callback('无内容，不再发送！')
      DEBUG && console.log('无内容，不再发送！')
    }
  }

  _ab2hext(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('')
  }

  send_publish_record() {
    if (this.connected == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('publish_records')
  }

  set_commands(commands) {
    // 所有的command过来一定要经过这里进行分类编组
    commands.split(';').forEach((_item) => {
      let item = _item.toUpperCase()
      if (item.slice(0, 2) == 'FA') {
        this.open_door_commands = this.open_door_commands.concat(item)
      } else {
        this.send_buffer_commands = this.send_buffer_commands.concat(item)
      }
    })
    this._send_buffer()
  }

  connectBluetooth() {
    if (this.DetectSys()) {
      this.begin_connect_at = new Date().getTime()
      this.openBlueAdapter()
    } else {
      this._sendEvent('cancel_connect')
    }
  }

  openBlueAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        DEBUG && console.log('打开兰牙，正准备连接...')
        this.getBluetoothAdapterState()
      },
      fail: (res) => {
        console.log('无法连接上兰牙...')
        this.try_to_connect_ble = false
        this._sendEvent('cannot_open_blue_tooth_adapter')
      },
    })
    wx.onBluetoothAdapterStateChange((res) => {
      var isDvailable = res.available //蓝牙适配器是否可用
      if (isDvailable) {
        if (!this.try_to_connect_ble) {
          wx.removeStorageSync(this.param_id)
          this.getBluetoothAdapterState()
        }
      } else {
        wx.stopBluetoothDevicesDiscovery()
        this._sendEvent('cannot_open_blue_tooth_adapter')
      }
    })
  }

  getBluetoothAdapterState() {
    this.try_to_connect_ble = true
    wx.getBluetoothAdapterState({
      success: (res) => {
        var isDvailable = res.available //蓝牙适配器是否可用
        if (isDvailable) {
          let id = wx.getStorageSync(this.param_id)
          let time = wx.getStorageSync(this.param_id + 'created_at')
          if (
            !id ||
            !time ||
            id.length < 16 ||
            time < Math.round(new Date().getTime() / 1000) - 3600 * 24
          ) {
            this.startBluetoothDevicesDiscovery()
          } else {
            this.deviceId = id
            console.log('存在已搜索到的结果，直接连接！')
            this.connectBle()
          }
        }
      },
    })
  }
  startBluetoothDevicesDiscovery() {
    this._ble_discover_timer = setTimeout(() => {
      this.blue_tooth_discovery = false
      this._sendEvent('not_found_device')
      this._sendEvent('stop_bluetooth_devices_discovery')
      wx.stopBluetoothDevicesDiscovery()
    }, 10000)
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: true, //是否允许重复上报同一设备, 如果允许重复上报，则onDeviceFound 方法会多次上报同一设备，但是 RSSI(信号) 值会有不同
      success: (res) => {
        console.log('开始扫描...')
        this._sendEvent('start_bluetooth_devices_discovery')
        this.blue_tooth_discovery = true
        this.onBluetoothDeviceFound() //监听寻找到新设备的事件
      },
      fail: (res) => {
        this.connect_callback &&
          this.connect_callback('start_device_discovery_error')
      },
    })
  }
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach((device) => {
        if (!device.name && !device.localName) {
          return
        }
        if (
          !(device.name.slice(0, 2) == 'FG') &&
          !(device.name.slice(0, 5) == 'MESH-')
        ) {
          return
        }
        this._sendEvent('found_other_device')
        let result = this._ab2hext(device.advertisData)
        this.reportFoundEvent(result)
        DEBUG && console.log('找到有效广播值', result.slice(-12).toUpperCase())
        if (result.slice(-12).toUpperCase() == this.param_id) {
          wx.stopBluetoothDevicesDiscovery()
          wx.setStorage({
            key: this.param_id,
            data: device.deviceId,
          })
          wx.setStorage({
            key: this.param_id + 'created_at',
            data: Math.round(new Date().getTime() / 1000),
          })
          this.deviceId = device.deviceId
          this.blue_tooth_discovery = false
          this._sendEvent('found_device')
          this._sendEvent('stop_bluetooth_devices_discovery')
          this.connectBle()
        }
      })
    })
  }

  reConnect() {
    wx.removeStorageSync(this.param_id)
    this.connectBluetooth()
  }

  sendConnectCommand() {
    setTimeout(() => {
      // this.send_ble('B9');
      // this.need_record();
      console.log('下发------------------------------')
      this.send_publish_record()
    }, 100)
  }

  connectBle() {
    this.begin_connect_at = new Date().getTime()
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: this.deviceId,
      success: (res) => {
        console.log('连接成功！')
        this.timeStamp = Math.floor(Date.now() / 1000)

        this.connected = true
        this.saveConnectStates(true, this.retry_connect, res)
        this.onConnectChange()
        this.auto_command && this.sendConnectCommand()
        this._sendEvent('connect_success')
        this.timerRelease()
      },
      fail: (res) => {
        if (res.errCode == -1) {
          this.connected = true

          this.onConnectChange()
          this.auto_command && this.sendConnectCommand()
          this._sendEvent('connect_success')
          this.saveConnectStates(true, this.retry_connect, res)
          this.timerRelease()
          return
        }
        this.saveConnectStates(false, this.retry_connect, res)
        this.connected = false
        this.retry_connect = this.retry_connect + 1
        console.log('重试连接。。。', res.errCode)
        this.connect_callback && this.connect_callback('retry_connect')
        if (this.retry_connect <= 2) {
          this.auto_retry && this.connectBle()
        } else {
          wx.removeStorageSync(this.param_id)
          this.connect_callback && this.connect_callback('retry_connect_error')
        }
      },
    })
  }

  // 保存连接时间
  saveConnectStates(connected, retry_connect, res) {
    let end_at = new Date().getTime()
    // 这里保存连接时长
    wx.request({
      url: API_URL + 'connect_data',
      data: {
        device_id: this.param_id,
        retry_connect: retry_connect,
        state: connected,
        begin_at: this.begin_connect_at,
        end_at: end_at,
        data: JSON.stringify(Object.assign({}, this.systemInfo, res)),
        post_add_on: JSON.stringify(this.post_add_on),
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        Authorization: this.token,
      },
      success: (res) => {},
    })
    this.begin_connect_at = new Date().getTime()
  }

  handleRetry() {
    this.auto_retry = false
  }

  onConnectChange() {
    wx.onBLEConnectionStateChange((res) => {
      DEBUG &&
        console.log(
          `device ${res.deviceId} state has changed, connected: ${res.connected}`
        )
      if (res.connected == true) {
        this.connected = true
        this.timerRelease()
        this._sendEvent('connect_success')
      } else {
        this.connected = false
        this._sendEvent('connect_false')
      }
    })
    wx.getBLEDeviceServices({
      deviceId: this.deviceId,
      success: (res) => {
        DEBUG && console.log('logs', '取得设备特征:')
        var main_service = 0
        res.services.forEach((service) => {
          if (
            service.uuid.split('-')[0] == '00001800' ||
            service.uuid.split('-')[0] == '00001801'
          ) {
          } else {
            console.log('主服务：', service.uuid)
            main_service++
            console.log('主服务数量：', main_service)
            wx.getBLEDeviceCharacteristics({
              deviceId: this.deviceId,
              serviceId: service.uuid,
              success: (res) => {
                res.characteristics.forEach((item) => {
                  DEBUG && console.log('取得service', service)
                  DEBUG && console.log('取得特征', item)
                  if (item.properties.write == true) {
                    this.writeUuids.push({
                      server_id: service.uuid,
                      uuid: item.uuid,
                    })
                  }
                  if (item.properties.notify == true) {
                    DEBUG && console.log('service.uuid:', service.uuid)
                    DEBUG && console.log('item.uuid:', item.uuid)
                    this.notifyBle(service.uuid, item.uuid)
                  }
                })
              },
              fail: (res) => {
                console.log('service', service)
                console.log('logs', JSON.stringify(res))
              },
            })
          }
        })

        if (main_service > 1) {
          this.multi_channel = true
        } else {
          this.multi_channel = false
        }
      },
    })
  }

  notifyBle(service_id, uuid) {
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: this.deviceId,
      serviceId: service_id,
      characteristicId: uuid,
      success: (res) => {
        this.onBleCharacterChange()
        DEBUG && console.log(service_id)
        DEBUG && console.log(uuid)
        DEBUG && console.log('Notify特征订阅成功！')
      },
      fail: (res) => {
        DEBUG && console.log('Notify特征订阅失败：', JSON.stringify(res))
      },
    })
  }

  reActive() {
    this.send_ble('reactive')
  }

  onBleCharacterChange() {
    wx.onBLECharacteristicValueChange((res) => {
      this.dealWithValueChange(res)
    })
  }

  dealWithValueChange(res) {
    console.log('取得回包------', res)
    this.notifyCallback && this.notifyCallback(res)
    this.dealWithV44(res)
  }

  _hex2ab(value) {
    var typedArray = new Uint8Array(
      value.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      })
    )
    var buffer = typedArray.buffer
    var bufLen = buffer.byteLength
    if (Math.floor(bufLen % 20) != 0) {
      var fillBuffer = new Uint8Array(Math.ceil(bufLen / 20) * 20)
      fillBuffer.set(typedArray)
      buffer = fillBuffer.buffer
    }
    return buffer
  }

  send_ble(command, mode = '') {
    wx.request({
      url: API_URL + 'std_command',
      data: {
        command: command,
        mode: mode,
        post_add_on: JSON.stringify(this.post_add_on),
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        Authorization: this.token,
      },
      success: (res) => {
        console.log(res, '-----------------------')
        if (res.data.error == 0) {
          this._sendEvent('send_command')
          DEBUG && console.log(res.data)
          DEBUG && console.log('logs', '待发送指令：' + res.data.command)
          this.send_buffer_commands = res.data.command.split(';')
          this._send_buffer()
        } else {
          this._sendEvent('error_' + res.data.error)
        }
      },
    })
  }

  _sendEvent(code) {
    this.connect_callback && this.connect_callback(code)
  }

  _saveToDb(command) {
    wx.request({
      url: API_URL + 'save_command',
      data: {
        device_id: this.param_id,
        command: command,
        post_add_on: JSON.stringify(this.post_add_on),
      },
      header: {
        'content-type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      success: (res) => {
        console.log(res.data)
      },
    })
  }

  dealWithSplitPackage(res, value) {
    if (this._cdwait == false && SPLIT_HEAD.includes(value.slice(0, 2))) {
      //收到需等待第一包
      this._cdwait = true
      this._cdpackage = 1
      this._cdcharacteristicId = res.characteristicId
      this._cddata = [value]
      return
    }
    if (
      this._cdwait == true &&
      res.characteristicId == this._cdcharacteristicId
    ) {
      if (this._cddata.includes(value)) {
        return
      }
      this._cdpackage = this._cdpackage + 1
      this._cddata.push(value)
      if (
        (value.slice(0, 2).toUpperCase() == 'A6' && this._cdpackage == 4) ||
        (value.slice(0, 2).toUpperCase() != 'A6' && this._cdpackage == 3)
      ) {
        this.saveCdData()
        this._cdwait = false
        this._cdpackage = 0
        this._cddata = []
        this._cdcharacteristicId = ''
        DEBUG && console.log('logs', '收到分包数据，重置分包接收器状态，并回复')
      }
      return
    }
  }
  saveCdData() {
    var cmd = this._cddata[0].slice(0, 2)
    var new_data = this._cddata.map((item) => {
      return item.slice(6)
    })
    this._saveToDb(cmd + new_data.join(''))
  }
  dealWithV44(res) {
    let value = this._ab2hext(res.value)

    DEBUG && console.log(`${res.characteristicId}收到回复${value}`)

    if (SPLIT_HEAD.includes(value.slice(0, 2))) {
      this.dealWithSplitPackage(res, value)
      return
    }
    this._saveToDb(value)

    if (value.slice(0, 2) == 'aa') {
      if (value.slice(0, 4) == 'aafa' && value.slice(-4, -2) != '01') {
        //响应aafa开门指令，但是执行结果不为成功，则释放锁定
        this._releaseBlock()
      }
      if (value.slice(-4, -2) == 'ea') {
        // 设备未激活，向线上请求激活参数
        this.need_active && this.reActive()
        return
      }
    }
    if (value.slice(0, 2) == 'b5') {
      // 20包一删除，回复B5
      this.writeBle(this._hex2ab(value))
    }
    if (value.slice(0, 2) == 'a5' && value.slice(16, 28) != 'ffffffffffff') {
      let a5_id = value.slice(2, 8)
      let buffer = 'F5' + this.param_id + a5_id
      this.writeBle(this._hex2ab(buffer))
      // 判断是不是物理电机关闭
      if (value.slice(16, 28) == '010100000007') {
        this._releaseBlock()
      }
      if (value.slice(16, 28) == '010100000006') {
        // 电机开启
        this.connect_callback('open_success')
      }
    } else {
      this._send_buffer()
    }
  }
}

module.exports = {
  BlueV4Adapter,
}
