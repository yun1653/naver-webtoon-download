const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

// 파일이름 : titleId_no_?? => 791140_01_03.jpg

//이미지 하나를 가져오는 함수 downloadImage
const downloadImage = (path, url, titleId, no, retryCount) => {
  const options = {
    url: url,
    headers: {
      referer: `https://comic.naver.com/webtoon/detail?titleId=${titleId}&no=${no}&weekday=wed`,
    }, // TODO: referer을 지정해주지 않으면 403 forbidden 나온다.
    encoding: null, // TODO: 지정안하면 utf8이다. binary 파일이라면 null로 해줘야함. request문서 매뉴얼에 나옴
  };

  request(options, function (error, response, body) {
    //TODO:  에러가 나면 재시도함. 자기자신을 다시 호출하는데 retryCount 횟수까지만 재시도
    if (error && --retryCounter >= 0) {
      console.log(`재시도 ${titleId} ${no} : ${retryCount}회 남음`);
      downloadImage(path, url, titleId, no, retryCount);
      return; // 밑에 부분은 실행하지 않아야 하기에 return문으로 함수를 마감 처리함.
    }

    console.log('error 여부: ', error);
    console.log('statusCode:', response && response.statusCode);

    fs.writeFile(
      path + '\\' + `${titleId}_${no}_${url.split('_IMAG01_')[1]}`,
      body,
      null,
      (error) => {
        // TODO: 경로 이름 정하는 것 자세히 봐라.
        if (error) throw error;
        console.log('이 파일이 저장되었습니다.');
      }
    );
  });
};

// 1화 전체의 이미지를 가져오는 함수 getImageUrls
const getImageUrls = (titleId, no) => {
  let originalUrl = `https://comic.naver.com/webtoon/detail?titleId=${titleId}&no=${no}&weekday=wed`;

  request(originalUrl, function (error, response, body) {
    const $ = cheerio.load(body);

    for (let i = 0; i < $('.wt_viewer img').length; i++) {
      downloadImage(
        'download',
        $('.wt_viewer img')[i].attribs.src,
        titleId,
        no,
        5 //에러났을 때 재요청은 5회만
      );
    }
  });
};

//1화부터 i화까지 다운로드
for (let i = 0, j = 0; i < 5; i++, j++) {
  setTimeout(() => {
    //TODO: 요청에 딜레이를 주는 방법 (j변수는 시간 딜레이를 위해 넣었음)
    getImageUrls(791140, i);
  }, j * 3000);
}
