import os
import unittest

import app


class AssetTest(unittest.TestCase):
    def setUp(self):
        app.app.testing = True
        self.client = app.app.test_client()

    def get_asset(self, filename, content_type):
        response = self.client.get('/asset/00ff00/%s' % filename)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, content_type)

        return response.data

    def test_javascript_files(self):
        data = self.get_asset('app.js', 'application/javascript')

        self.assertIn('cApp.Startup.initTabs();', data)
        self.assertIn('cApp.Navigation.ensureActiveTabIsVisible();', data)

        data = self.get_asset('datetime.js', 'application/javascript')

        self.assertIn('app.DateTime = {', data)
        self.assertIn('formatTimeFromNow: function (containerId) {', data)
        self.assertIn('formatDateTime: function (containerId) {', data)

        data = self.get_asset('github.js', 'application/javascript')

        self.assertIn('app.Startup.addInitTask(function() {', data)
        self.assertIn('baseUrl = \'https://api.viktoradam.net/github\'', data)
        self.assertIn('var generateMarkup = function (repo) {', data)
        self.assertIn('var loadProjects = function () {', data)

        data = self.get_asset('dockerhub.js', 'application/javascript')

        self.assertIn('app.DockerHub = {', data)
        self.assertIn('app.Startup.addInitTask(function() {', data)
        self.assertIn('baseUrl = \'https://api.viktoradam.net/docker\'', data)
        self.assertIn('var generateMarkup = function (repo, placeholder) {', data)
        self.assertIn('var loadProject = function (repositoryName) {', data)
        self.assertIn('var loadProjects = function () {', data)
        self.assertIn('var generateTags = function (repoFullName, containerId) {', data)

    def test_css_files(self):
        data = self.get_asset('styles.css', 'text/css; charset=utf-8')

        self.assertIn('.markdown pre code {', data)
        self.assertIn('.markdown a.anchor {', data)
        self.assertIn('.mdl-list.condensed-list {', data)

    def test_favicon(self):
        response = self.client.get('/favicon.ico')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'image/vnd.microsoft.icon')

        path = os.path.join(os.path.dirname(__file__), '../src/assets/favicon.ico')
        self.assertEqual(response.data, open(path).read())

    def test_use_strict(self):
        base_directory = os.path.join(os.path.dirname(__file__), '../src/assets')

        for item in os.listdir(base_directory):
            if item.endswith('.js'):
                with open(os.path.join(base_directory, item)) as script:
                    self.assertIn("'use strict';", script.read())

