// 以下仅供内部使用
// import * as server from '../../servers.js';
// const DEBUG = true;
// const API_URL = server.baseUrl() + "/api/locksdk/";

// 接入商请使用下面配置
const DEBUG = true
const API_URL = 'https://lock.wangjile.cn/api/locksdk/'

class BlueAdapter {
  constructor(params_id, version, token, connect_callback, _auto_retry = true) {
    console.log('进入了例子中....................')
    console.log(connect_callback)
    console.log('进入了例子中....................')
    this.param_id = params_id
    this.version = version
    this.token = token
    this.connect_callback = connect_callback
    this._ble_discover_timer = null
    this.post_add_on = {}
    // 主要使用连接参数
    this.deviceId = ''
    this.retry_connect = 0
    this.writeUuids = []
    this.blue_tooth_discovery = false
    this.connect_ble = false
    this.send_buffer_commands = []
    this.auto_retry = _auto_retry
    this.try_to_connect_ble = false

    // 回包特殊通道
    this._cfwait = false
    this._cfpackage = 0
    this._cfdata = []
    this._cfcharacteristicId = ''
    this._cdwait = false
    this._cdpackage = 0
    this._cddata = []
    this._cdcharacteristicId = ''
    this.timeStamp = Math.floor(Date.now() / 1000)
    this.activev20 = false

    this.open_command_id = ''

    this.systemInfo = wx.getSystemInfoSync()
  }

  getParamId() {
    return this.param_id
  }

  getDeviceId() {
    return this.deviceId
  }

  openDoor() {
    console.log('--------------')
    this.send_ble('open')
  }

  forceOpen() {
    this.send_ble('force_open')
  }

  addData(addon = {}) {
    this.post_add_on = addon
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

  // 释放
  release() {
    if (this._ble_discover_timer) {
      clearTimeout(this._ble_discover_timer)
    }
    if (this.blue_tooth_discovery == true) {
      this._sendEvent('release_stop_bluetooth_devices_discovery')
      wx.stopBluetoothDevicesDiscovery()
      this.blue_tooth_discovery = false
    }
    if (this.connect_ble == true && this.deviceId) {
      wx.closeBLEConnection({
        deviceId: this.deviceId,
        success: (res) => {
          this._sendEvent('close_connection')
        },
      })
      this.connect_ble = false
    }
  }

  connectStatus() {
    return this.connect_ble
  }

  send_publish_record() {
    if (this.connect_ble == false) {
      DEBUG && console.log('未连接上兰牙，不允许下发')
      return
    }
    this.send_ble('publish_records')
  }

  _writeBle(buffer) {
    if (this.writeUuids.length < 1) {
      this._sendEvent('no_write_uuids')
      return false
    }
    let { server_id, uuid } = this.writeUuids[0]
    wx.writeBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: server_id,
      characteristicId: uuid,
      value: buffer,
      success: (res) => {
        DEBUG && console.log(JSON.stringify(res))
      },
      fail: (res) => {
        DEBUG && console.log(JSON.stringify(res))
      },
    })
  }

  _send_buffer() {
    let buffer = this.send_buffer_commands.shift()
    if (buffer) {
      this.storeOpenCommandId(buffer)
      setTimeout(() => {
        this._writeBle(this._hex2ab(buffer))
      }, 20)
    }
  }

  need_record() {
    this.send_ble('need_record')
  }

  need_active() {
    this.send_ble('need_active')
    setTimeout(() => {
      this.send_ble('std_time')
    }, 1000)
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

  // 1.0 连接兰牙
  connectBluetooth() {
    wx.openBluetoothAdapter({
      success: (res) => {
        this.getBluetoothAdapterState()
      },
      fail: (res) => {
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

  handleRetry() {
    this.auto_retry = false
  }

  reConnect() {
    wx.removeStorageSync(this.param_id)
    this.connectBluetooth()
  }

  getBluetoothAdapterState() {
    this.try_to_connect_ble = true
    wx.getBluetoothAdapterState({
      success: (res) => {
        var isDvailable = res.available //蓝牙适配器是否可用
        if (isDvailable) {
          let cached_deviceId = wx.getStorageSync(this.param_id)
          let time = wx.getStorageSync(this.param_id + 'created_at')
          if (cached_deviceId == undefined || cached_deviceId.length < 16) {
            console.log('开始连接--------------')
            this.startBluetoothDevicesDiscovery()
          } else if (
            time &&
            time < Math.round(new Date().getTime() / 1000) - 3600 * 24
          ) {
            console.log('开始连接--------------')
            this.startBluetoothDevicesDiscovery()
          } else {
            this._sendEvent('use_cached_device_id')
            this.deviceId = cached_deviceId
            this._connectBle()
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
      interval: 0,
      allowDuplicatesKey: true, //是否允许重复上报同一设备, 如果允许重复上报，则onDeviceFound 方法会多次上报同一设备，但是 RSSI(信号) 值会有不同
      success: (res) => {
        this._sendEvent('start_bluetooth_devices_discovery')
        this.blue_tooth_discovery = true
        this.onBluetoothDeviceFound() //监听寻找到新设备的事件
      },
    })
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

  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach((device) => {
        if (!device.name && !device.localName) {
          return
        }
        console.log(device.name, '----------------')
        if (
          !(device.name.slice(0, 5) == 'MESH-') &&
          !(device.name.slice(0, 2) == 'FG')
        ) {
          return
        }
        this._sendEvent('found_other_device')
        console.log('找到设备---', device.name)
        console.log('待连接设备---', this.param_id)
        let result = this._ab2hext(device.advertisData)
        // 搜索到设备进行上报
        this.reportFoundEvent(result)
        if (result.slice(-12).toUpperCase() == this.param_id) {
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
          this._connectBle()
          wx.stopBluetoothDevicesDiscovery()
        }
      })
    })
  }
  preCommand() {
    this.send_ble('std_time')
    this.need_record()
  }
  sendConnectCommand() {
    setTimeout(() => {
      // this.send_ble('B9');
      // this.need_record();
      this.send_publish_record()
    }, 200)
  }
  _connectBle() {
    this.begin_connect_at = new Date().getTime()
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: this.deviceId,
      success: (res) => {
        this.timeStamp = Math.floor(Date.now() / 1000)
        this.connect_ble = true
        this.connect_callback && this.connect_callback('connect_success')
        this.sendConnectCommand()
        this.onConnectChange()
        this.saveConnectStates(true, this.retry_connect, res)
      },
      fail: (res) => {
        if (res.errCode == -1) {
          console.log('到了这里------------------')
          this.connect_ble = true
          this.connect_callback && this.connect_callback('connect_success')
          this.sendConnectCommand()
          if (this._ble_discover_timer) {
            clearTimeout(this._ble_discover_timer)
          }
          this.onConnectChange()
          this.saveConnectStates(true, this.retry_connect, res)
          return
        }
        this.retry_connect = this.retry_connect + 1
        DEBUG && console.log('重试连接。。。', res)
        DEBUG && console.log('重试连接。。。', res.errCode)
        this.connect_callback && this.connect_callback('retry_connect')
        DEBUG && console.log('重试连接。。。', this.retry_connect)
        DEBUG && console.log('重试连接。。。', this.auto_retry)
        this.saveConnectStates(false, this.retry_connect, res)
        if (this.retry_connect <= 2) {
          this.auto_retry && this._connectBle()
        } else {
          wx.removeStorageSync(this.param_id)
          this.connect_callback && this.connect_callback('retry_connect_error')
        }
      },
    })
  }

  onConnectChange() {
    wx.onBLEConnectionStateChange((res) => {
      console.log(
        `device ${res.deviceId} state has changed, connected: ${res.connected}`
      )
      if (res.connected == true) {
        this.connect_callback && this.connect_callback('connect_success')
        if (this._ble_discover_timer) {
          clearTimeout(this._ble_discover_timer)
        }
      } else {
        this.release()
        this.connect_callback && this.connect_callback('connect_false')
      }
    })
    console.log('-----------------------不执行了吗？')
    console.log(this.deviceId, '---------------------')
    wx.getBLEDeviceServices({
      deviceId: this.deviceId,
      success: (res) => {
        console.log('logs', '取得设备特征:')
        res.services.forEach((service) => {
          console.log('取得service', service)
          wx.getBLEDeviceCharacteristics({
            deviceId: this.deviceId,
            serviceId: service.uuid,
            success: (res) => {
              res.characteristics.forEach((item) => {
                if (item.properties.write == true) {
                  DEBUG && console.log('service', service)
                  DEBUG && console.log('item', item)
                  this.writeUuids.push({
                    server_id: service.uuid,
                    uuid: item.uuid,
                  })
                  console.log(this.writeUuids)
                  console.log(this.writeUuids, '-----------writeUuids---------')
                  this.writeUuids.length == 1 &&
                    this.connect_callback &&
                    this.connect_callback('connect_success')
                  if (this._ble_discover_timer) {
                    clearTimeout(this._ble_discover_timer)
                  }
                }
                if (item.properties.notify == true) {
                  DEBUG &&
                    console.log('logs', '取得特征值，开始订阅notify... ...')
                  this.notifyBle(service.uuid, item.uuid)
                }
              })
              this.preCommand()
            },
            fail: (res) => {
              DEBUG && console.log('logs', JSON.stringify(res))
            },
          })
        })
      },
      fail: (res) => {
        console.log(res, '-------------------asdfklasdfjklajdkfljakldfjl')
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
        console.log('logs', '特征订阅成功！')
      },
      fail: (res) => {
        console.log('logs', JSON.stringify(res))
      },
    })
  }

  onBleCharacterChange() {
    wx.onBLECharacteristicValueChange((res) => {
      console.log('收到回包', res)
      if (this.version == 'm0001') {
        this._dealWithV13(res)
      } else if (this.version == 'n0001') {
        this._dealWithV14(res)
      }
    })
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

  storeOpenCommandId(command) {
    DEBUG && console.log('发送数据：', command)

    if (
      command.slice(0, 2) == 'BA' &&
      (command.slice(10, 12) == '01' || command.slice(10, 12) == '02')
    ) {
      this.open_command_id = command.slice(2, 10).toLowerCase()
      console.log('开门指令：' + this.open_command_id)
    }
  }

  _dealWithV14(res) {
    let value = this._ab2hext(res.value)
    console.log('logs', `${res.characteristicId}收到回复${value}`)
    if (value.slice(0, 2) == 'cd' && value == 'cdeeeeeeee') {
      this._cdwait = false
      this._cdpackage = 0
      this._cddata = []
      this._cdcharacteristicId = ''
      this._saveToDb(value)
      return
    }
    if (this._cdwait == false && value.slice(0, 2) == 'cd') {
      //收到cd第一包
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
      this._cdpackage = this._cdpackage + 1
      this._cddata.push(value)
      if (this._cdpackage === 3) {
        this._saveToDb(this._cddata.join())
        let buffer = this._cddata.join().slice(0, 10)
        this._cdwait = false
        this._cdpackage = 0
        this._cddata = []
        this._cdcharacteristicId = ''
        DEBUG && console.log('logs', 'CD收到三包，重置cd接收器状态，并回复')
        DEBUG && console.log('logs', 'CD回复:' + buffer)
        this._writeBle(this._hex2ab(buffer))
      }
      return
    }
    this._saveToDb(value)

    if (
      value.slice(0, 2) == 'ce' &&
      value.slice(12, 14) == 'e1' &&
      this.activev20 == false
    ) {
      this.activev20 = true
      console.log('需要激活-------------')
      setTimeout(() => {
        this.activev20 = false
      }, 2000)
      this.need_active()
      return
    }
    if (value.slice(0, 2) == 'ce' && value.slice(12, 14) == 'ef') {
      this.send_ble('std_time')
      return
    }
    // if (value.slice(0, 2) == "cc") {
    //   let buffer = value.slice(0, 12)
    //   DEBUG && console.log('logs', 'CC回复:' + buffer);
    //   this._writeBle(this._hex2ab(buffer))
    // } else

    if (
      value.slice(0, 4) == 'ceba' &&
      value.slice(4, 12) == this.open_command_id
    ) {
      if (this.connect_callback) {
        switch (value.slice(12, 14)) {
          case '01':
            this.connect_callback('open_success')
            break
          case '02':
            this.connect_callback('open_fail')
            break
          default:
            this.connect_callback('lock_error')
        }
      }
    }
    if (value.slice(0, 2) == 'cd') {
      let buffer = value.slice(0, 8) + value.slice(20, 24)
      DEBUG && console.log('logs', 'CD回复:' + buffer)
      this._writeBle(this._hex2ab(buffer))
    } else {
      this._send_buffer()
    }
  }

  _dealWithV13(res) {
    let value = this._ab2hext(res.value)
    if (value.slice(0, 4) == 'b2ce') {
      if (value.slice(12, 14) == '01') {
        this.connect_callback && this.connect_callback('open_success')
      } else if (value.slice(12, 14) == '02') {
        this.connect_callback && this.connect_callback('open_error')
      } else {
        this.connect_callback && this.connect_callback('open_verify_error')
      }
    }
    if (value.slice(0, 4) == 'b1ce') {
      if (value.slice(12, 14) == '01') {
        this.connect_callback && this.connect_callback('forceopen_success')
      } else if (value.slice(12, 14) == '02') {
        this.connect_callback && this.connect_callback('forceopen_error')
      } else {
        this.connect_callback && this.connect_callback('forceopen_verify_error')
      }
    }

    if (value.slice(0, 2) == 'cd' && value == 'cdeeeeeeee') {
      this._cdwait = false
      this._cdpackage = 0
      this._cddata = []
      this._cdcharacteristicId = ''
      this._saveToDb(value)
      return
    }
    if (this._cdwait == false && value.slice(0, 2) == 'cd') {
      //收到cd第一包
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
      this._cdpackage = this._cdpackage + 1
      this._cddata.push(value)
      if (this._cdpackage === 3) {
        this._saveToDb(this._cddata.join())
        let buffer = this._cddata.join().slice(0, 10)
        this._cdwait = false
        this._cdpackage = 0
        this._cddata = []
        this._cdcharacteristicId = ''
        // console.log('logs', 'CD回复:' + buffer);
        this._writeBle(this._hex2ab(buffer))
      }
      return
    }
    if (this._cfwait == false && value.slice(0, 2) == 'cf') {
      // 收到cf第一包
      this._cfwait = true
      this._cfpackage = 1
      this._cfcharacteristicId = res.characteristicId
      this._cfdata = [value]
      return
    }
    if (
      this._cfwait == true &&
      res.characteristicId == this._cfcharacteristicId
    ) {
      this._cfpackage = this._cfpackage + 1
      this._cfdata.push(value)
      if (this._cfpackage === 3) {
        this._saveToDb(this._cfdata.join())
        let buffer = this._cfdata.join().slice(0, 10)
        this._cfwait = false
        this._cfpackage = 0
        this._cfdata = []
        this._cfcharacteristicId = ''
        // console.log('logs', 'CC回复:' + buffer);
        this._writeBle(this._hex2ab(buffer))
      }
      return
    }

    this._saveToDb(value)
    if (value.slice(0, 2) == 'cc') {
      let mode = value.slice(2, 4)
      if (mode == 'ee') {
      } else {
        let begin = value.length - 20
        let end = value.length - 12
        let time = value.slice(begin, end)
        if (this.timeStamp > this._hextimestamp(time)) {
          // 回复
          let buffer = value.slice(0, begin)
          this._writeBle(this._hex2ab(buffer))
        }
      }
    } else if (value.slice(0, 2) == 'cd') {
      let mode = value.slice(2, 4)
      let total = value.slice(4, 6)
      let now = value.slice(6, 8)
      if (mode == 'ee' || total == now) {
      } else {
        this._writeBle(this._hex2ab(value.slice(0, 8)))
      }
    } else {
      this._send_buffer()
    }
  }

  _sendEvent(code) {
    this.connect_callback && this.connect_callback(code)
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
  _hextimestamp(value) {
    var typedArray = new Uint8Array(
      value.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      })
    )
    let num = 0
    typedArray.forEach((res, idx) => {
      num += res * 256 ** (3 - idx)
    })
    return num
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
}

module.exports = {
  BlueAdapter,
}
