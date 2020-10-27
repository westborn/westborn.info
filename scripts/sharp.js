const fs = require('fs');
const glob = require('glob');
const path = require('path');
const sharp = require('sharp');

const resizes = [
  {
    src: './src/images/*.png',
    dist: './src/images/90',
    percent: 90,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/80',
    percent: 80,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/70',
    percent: 70,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/60',
    percent: 60,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/50',
    percent: 50,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/40',
    percent: 40,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/30',
    percent: 30,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/20',
    percent: 20,
  },
  {
    src: './src/images/*.png',
    dist: './src/images/10',
    percent: 10,
  },
];

const formats = [
  {
    src: './src/images/*.png',
    dist: './src/images/webp',
    format: 'webp',
  },
];

resizes.forEach((resize) => {
  if (!fs.existsSync(resize.dist)) {
    fs.mkdirSync(resize.dist, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  let files = glob.sync(resize.src);

  files.forEach((file) => {
    let filename = path.basename(file);
    const image = sharp(file);
    image
      .metadata()
      .then((metadata) => {
        return image
          .resize(Math.round(metadata.width * (resize.percent / 100)))
          .png()
          .toFile(`${resize.dist}/${filename}`)
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

formats.forEach((format) => {
  if (!fs.existsSync(format.dist)) {
    fs.mkdirSync(format.dist, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  let files = glob.sync(format.src);

  files.forEach((file) => {
    let filename = path.basename(file);
    const image = sharp(file);
    image
      .webp()
      .toFile(`${format.dist}/${filename.replace('png', 'webp')}`)
      .catch((err) => {
        console.log(err);
      });
  });
});
