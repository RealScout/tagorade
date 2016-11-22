# Overview

[![Build Status](https://travis-ci.org/RealScout/tagorade.svg?branch=master)](https://travis-ci.org/RealScout/tagorade)

This is a simple tool for generating an interface to quickly build
training sets to feed into deep learning computer vision models.

We've been able to tag batches of 1000 photos in about 30 minutes. It
could be faster or slower for your use case depending on the complexity
of your classification problem.

![screen shot](https://github.com/RealScout/tagorade/raw/gh-pages/images/screenshot.png)

## Tagging on your local machine

#### Generate html

``` bash
python tagging_html_generator.py \
  --photos-file example-local-photos.json \
  --config-file example-local-config.json \
  > ./build/index.html
```

#### Start tagging images

```
python -m http.server
```

Then open `http://localhost:8000/build/index.html` and tag away.

Copy the console output after hitting `Enter` into your favorite
file editor to clean up. Yeah, really.

## Tagging with Mechanical Turk

Simply set `formAction` in your config file to the
[External Question Form Action](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExternalQuestionArticle.html#ApiReference_ExternalQuestionArticle-the-external-form-the-form-action) and
generate the html just as we did above.

You can then insert the generated html into an [HTMLQuestion](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HTMLQuestionArticle.html).

## Contributing

There are two parts to this html generator:

1. The javascript
2. The python html generator

To update the distributed javascript and css in `./dist/`, run the
following:

```
pushd react-ui && \
  npm install && \
  npm run-script build && \
  popd
```

### Testing

The javascript is currently not tested, but you can run tests for
the html generation with the following:

```
python -m unittest tagging_html_generator_test
```