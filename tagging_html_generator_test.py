import json
import os
import subprocess
import unittest

import tagging_html_generator


class HtmlTestCases(unittest.TestCase):
    def test_generate_html_contains_config(self):
        result = tagging_html_generator.generate_html([], {'hi': 'there'})
        self.assertIn('<script type="text/javascript">var config = {"hi": "there"};</script>', result)

    def test_generate_html_contains_photos(self):
        result = tagging_html_generator.generate_html([{'id': 1}], {})
        self.assertIn('<script type="text/javascript">var photos = [{"id": 1}];</script>', result)

    def test_generate_html_contains_container(self):
        result = tagging_html_generator.generate_html([], {})
        self.assertIn('<body><div id="container"></div></body>', result)

    def test_generate_html_references_correct_js_bundle(self):
        result = tagging_html_generator.generate_html([], {'jsBundle': 'http://aws.com/our-bundle.json'})
        expected_script_tag = r'<script type="text/javascript" language="JavaScript 1.7" src="http://aws.com/our-bundle.json"></script>'
        self.assertIn(expected_script_tag, result)

    def test_generate_html_references_correct_css_source(self):
        result = tagging_html_generator.generate_html([], {'cssBundle': 'http://aws.com/main.css'})
        expected_link_tag = r'<link rel="stylesheet" href="http://aws.com/main.css">'
        self.assertIn(expected_link_tag, result)

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))


class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.test_photos_file = os.path.join(__location__, 'test-photos.json')
        with open(self.test_photos_file) as file:
            self.test_photos = json.load(file)

        self.test_config_file = os.path.join(__location__, 'test-config.json')
        with open(self.test_photos_file) as file:
            self.test_config = json.load(file)

    def test_command_line_interface_photo_file_as_stdin(self):
        generator_file = os.path.join(__location__, 'tagging_html_generator.py')
        command = ['python', generator_file, '--config-file', self.test_config_file]
        result = subprocess.check_output(command, stdin=open(self.test_photos_file))
        self.assertIn(b'http://lorempixel.com/700/500/city/1', result)
        self.assertIn(b'https://rs-mturk-assets.s3.amazonaws.com/main-bundle.js', result)
        self.assertIn(b'Not Stainless', result)

    def test_command_line_interface_photo_file_as_arg(self):
        generator_file = os.path.join(__location__, 'tagging_html_generator.py')
        command = ['python', generator_file, '--config-file', self.test_config_file, '--photos-file', self.test_photos_file]
        result = subprocess.check_output(command)
        self.assertIn(b'http://lorempixel.com/700/500/city/1', result)
        self.assertIn(b'https://rs-mturk-assets.s3.amazonaws.com/main-bundle.js', result)
        self.assertIn(b'Not Stainless', result)
