import os
import json
import unittest

import app


class RenderTest(unittest.TestCase):
    def setUp(self):
        app.app.testing = True
        self.client = app.app.test_client()

    def get_fragment(self, fragment_type, payload):
        response = self.client.post('/render/%s' % fragment_type, 
                                    data=json.dumps(payload), 
                                    content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.content_type)
        self.assertEqual(response.charset, 'utf-8')

        return response.data

    def load_payload(self, filename):
        path = os.path.join(os.path.dirname(__file__), filename)
        with open(path) as input_file:
            return json.load(input_file)

    def test_render_github(self):
        payload = self.load_payload('github_payload.json')
        content = self.get_fragment('github', payload)
        
        self.assertIn('<div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--4-col mdl-cell--top github" id="github-%s">' % payload['name'], content)
        self.assertIn('<span id="github-time-pushed-%s" class="mdl-chip mdl-chip--contact">' % payload['name'], content)
        self.assertIn('href="%s"' % payload['html_url'], content)
        self.assertIn(payload['full_name'], content)
        self.assertIn('cApp.DateTime.formatTimeFromNow(\'github-%s\');' % payload['name'], content)
        self.assertIn('cApp.DateTime.formatDateTime(\'github-%s\');' % payload['name'], content)

    def test_render_dockerhub(self):
        payload = self.load_payload('dockerhub_payload.json')
        content = self.get_fragment('dockerhub', payload)
        
        self.assertIn('<div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--4-col mdl-cell--top dockerhub" id="dockerhub-%s">' % payload['name'], content)
        self.assertIn('<span id="dockerhub-time-pushed-%s" class="mdl-chip mdl-chip--contact">' % payload['name'], content)
        self.assertIn('href="https://hub.docker.com/r/%s/%s/"' % (payload['namespace'], payload['name']), content)
        self.assertIn(payload['description'], content)
        self.assertIn('<h1>README</h1>', content)
        self.assertIn('<p>Sample readme contents.</p>', content)
        self.assertIn('cApp.DateTime.formatTimeFromNow(\'dockerhub-%s\');' % payload['name'], content);
        self.assertIn('cApp.DateTime.formatDateTime(\'dockerhub-%s\');' % payload['name'], content)
        self.assertIn('cApp.DockerHub.generateTags(\'%s/%s\', \'dockerhub-tags-%s\');' % (payload['namespace'], payload['name'], payload['name']), content)

    def test_replace_http_links_in_markdown(self):
        payload = self.load_payload('dockerhub_payload.json')
        
        payload['full_description'] = '# HTTP link\nThis [link](http://example.com) used to use http.'

        content = self.get_fragment('dockerhub', payload)

        self.assertNotIn('http://', content)
        self.assertIn('href="https://example.com"', content)

