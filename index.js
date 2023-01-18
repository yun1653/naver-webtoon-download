const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const originalUrl =
  'https://comic.naver.com/webtoon/detail?titleId=791140&no=41&weekday=wed';

//함수 하나 만들자
const downloadImage = (path, url) => {
  const options = {
    url: url,
    headers: { referer: originalUrl }, // TODO: referer을 지정해주지 않으면 403 forbidden 나온다.
    encoding: null, // TODO: 지정안하면 utf8이다. binary 파일이라면 null로 해줘야함. request문서 매뉴얼에 나옴
  };

  request(options, function (error, response, body) {
    console.log('statusCode:', response && response.statusCode);
    fs.writeFile(path + '\\' + url.split('_IMAG')[1], body, null, (error) => {
      // TODO: 경로 이름 정하는 것 자세히 봐라.
      if (error) throw error;
      console.log('이 파일이 저장되었습니다.');
    });
  });
};

request(originalUrl, function (error, response, body) {
  const $ = cheerio.load(body);

  for (let i = 0; i < $('.wt_viewer img').length; i++) {
    downloadImage('download', $('.wt_viewer img')[i].attribs.src);
  }

  // downloadImage('download', $('.wt_viewer img')[0].attribs.src);

  console.log($('.wt_viewer img').length);
});
