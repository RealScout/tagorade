import json

HTML_TEMPLATE = """
    <!DOCTYPE html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=UTF-8">
            <title>Image Tagging</title>

            <script type='text/javascript' src='https://s3.amazonaws.com/mturk-public/externalHIT_v1.js'></script>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.0.1/css/foundation.min.css">
            <link rel="stylesheet" href="{}">

            <script type="text/javascript">var config = {};</script>
            <script type="text/javascript">var photos = {};</script>
        </head>
        <body><div id="container"></div></body>
        <script type="text/javascript" language="JavaScript 1.7" src="{}"></script>
    </html>
"""

def generate_html(photos, config):
    """

    :param config:
    :return:

    """
    return HTML_TEMPLATE.format(config.get('cssBundle'), json.dumps(config), json.dumps(photos), config.get('jsBundle'))

if __name__ == '__main__':
    import argparse
    import sys

    parser = argparse.ArgumentParser()
    parser.add_argument('--photos-file', nargs='?', type=argparse.FileType('r'), default=sys.stdin)
    parser.add_argument('--config-file', type=argparse.FileType('r'))
    args = parser.parse_args()

    photos = json.load(args.photos_file)
    config = json.load(args.config_file)

    print(generate_html(photos, config))