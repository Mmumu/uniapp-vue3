export function isWechatSupportWebp(): boolean {
  const { platform, system } = wx.getSystemInfoSync()

  const versionResult = /[0-9.]*$/.exec(system)
  const systemVersion = versionResult ? versionResult[0] : ''
  const iosSystemSupport =
    platform === 'ios' &&
    !!systemVersion &&
    compareVersion(systemVersion, '14.0') >= 0

  return platform === 'devtools' || platform === 'android' || iosSystemSupport
}

export function compareVersion(v1: string, v2: string): number {
  const v1List = v1.split('.')
  const v2List = v2.split('.')
  const len = Math.max(v1List.length, v2List.length)
  while (v1List.length < len) {
    v1List.push('0')
  }
  while (v2List.length < len) {
    v2List.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1List[i])
    const num2 = parseInt(v2List[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}
