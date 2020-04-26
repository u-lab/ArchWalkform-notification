
/*spreadsheet取得*/
function getData(){
  const sheet = SpreadsheetApp.getActiveSheet();
  let data = sheet.getDataRange().getValues();
  let keys = data.splice(0, 1)[0];
  /*1行目をkeyとして取得、オブジェクト生成*/
  return data.map(function(row) {
    var obj = {}
    row.map(function(item, index) {
      obj[keys[index]] = item;
    });
    return obj;
  });
  
}

/*spreadsheet更新日時取得*/
function getLastDate(){
  let data = getData();
  /*date取り出し*/
  const date = data.map(function(object){
    return object.タイムスタンプ;
  });
  return date[date.length - 1].getTime();
}

/*タイムテーブルの時間帯に更新があったか*/
function judgeSheet(){
  /*ex)現在22:33の時22:00を取得(gettimeはミリ秒)*/
  let justTime = new Date();
  justTime.setMinutes(0);
  justTime.setSeconds(0);
  console.log(justTime.getTime() - getLastDate());
  if(justTime.getTime() - getLastDate() <= 3600000 && justTime.getHours() >= 9 && justTime.getTime() - getLastDate() > 0){
    return "day";
  }
  else if(justTime.getTime() - getLastDate() <= 28800000 && justTime.getHours() == 8 && justTime.getTime() - getLastDate() > 0){
    return "night";
  }
  else{
    return false;
  }
}


function payLoadTemplate(){
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
  /*ex)現在11:33の時11:00を取得*/
  let justTime = new Date();
  justTime.setMinutes(0);
  justTime.setSeconds(0);
  /*ex)現在11:33の時10:00を取得*/
  let beforeTime = new Date();
  beforeTime.setMinutes(0);
  beforeTime.setSeconds(0);
  beforeTime.setHours(beforeTime.getHours() - 1);
  /* init variable finish */


  /*新規オブジェクト取り出し(1時間以内)*/
  data = data.filter(function(obj){
    const timestamp = obj.タイムスタンプ.getTime()
    const diff = justTime.getTime() - timestamp
    return 0 < diff && diff <= 3600000;
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
      strBody += c.name +": "+ c.count + "件\n";
    }
  }
  strBody += "\n";
  for(let i = 1; i <= bugObj.length; i++){
    strBody += NOTIFICATION + "の内容 " + i + "\n";
    strBody += bugObj[i-1].お問い合わせ内容_件名 + "\n";
  }

  return strBody;
}

  
  
  function sendSlack(){
    const url = "";
    const payload = { "text" : payLoadTemplate()};
    const payloadNight = { "text" : payLoadTemplateNight()};
    const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
    const optionsNight = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payloadNight)
  };
    if(judgeSheet() === "day"){
    var response = UrlFetchApp.fetch(url, options);
    }
    else if(judgeSheet() === "night"){
      var response = UrlFetchApp.fetch(url, optionsNight);
  }
  }
  
  