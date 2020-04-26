const CATEGORY = 'カテゴリ';
const NOTIFICATION = 'バグ報告';

function payLoadTemplateNight(){
  let data = getData();
  let counts = [
    { count: 0, name: 'アカウントについて'},
    { count: 0, name: 'バグ報告' },
    { count: 0, name: '新機能提案'},
    { count: 0, name: 'その他'}
  ];

  console.log(data);

  /**
   * =====================================================
   *
   * init variable start
   */
  /*ex)現在8:33の時8:00を取得*/
  let justTime = new Date();
  justTime.setMinutes(0);
  justTime.setSeconds(0);
  /*ex)現在8:33の時00:00を取得*/
  let beforeTime = new Date();
  beforeTime.setMinutes(0);
  beforeTime.setSeconds(0);
  beforeTime.setHours(beforeTime.getHours() - 8);
  /* init variable finish */


  /*新規オブジェクト取り出し(8時間以内)*/
  data = data.filter(function(obj){
    const timestamp = obj.タイムスタンプ.getTime()
    const diff = justTime.getTime() - timestamp
    return 0 < diff && diff <= 28800000;
  });

  /*バグ報告のオブジェクトを取りだし*/
  const bugObj = data.filter(function(obj) {
    return obj[CATEGORY] === NOTIFICATION;
  });

  /*件数取得*/
  for(let d of data){
    for (let c of counts) {
      if (d[CATEGORY] === c.name) {
        c.count++;
        break;
      }
    }
  }

  /*slackに流す文章*/
  let strBody = formatDate(new Date(), 'MM/dd HH:mm') + "\n";
  strBody += formatDate(beforeTime, 'HH:mm') + "~" + formatDate(justTime, 'HH:mm') + "\n";

  for (let c of counts) {
    if (c.count > 0) {
      strBody += c.name + ": "+ c.count + "件\n";
    }
  }
  strBody += "\n";
  for(let i = 1; i <= bugObj.length; i++){
    strBody += NOTIFICATION + "の内容 " + i + "\n";
    strBody += bugObj[i-1].お問い合わせ内容_件名 + "\n";
  }

  return strBody;
}

function formatDate(date, format) {
  return Utilities.formatDate(date, 'Asia/Tokyo', format)
}