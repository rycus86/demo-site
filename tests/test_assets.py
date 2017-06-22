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

        self.assertIn('cApp.Startup.initSlickCarousel();', data)
        self.assertIn('cApp.Startup.initTabs();', data)
  
        data = self.get_asset('datetime.js', 'application/javascript')

        self.assertIn('app.DateTime = {', data)
        self.assertIn('formatTimeFromNow: function (container_id) {', data)
        self.assertIn('formatDateTime: function (container_id) {', data)

        data = self.get_asset('github.js', 'application/javascript')

        self.assertIn('$(document).ready(function() {', data)
        self.assertIn('base_url = \'http://github.api.viktoradam.net\'', data)
        self.assertIn('var generateMarkup = function (repo) {', data)
        self.assertIn('var loadProjects = function () {', data)

        data = self.get_asset('dockerhub.js', 'application/javascript')
        
        self.assertIn('app.DockerHub = {', data)
        self.assertIn('$(document).ready(function() {', data)
        self.assertIn('base_url = \'http://docker.api.viktoradam.net\'', data)
        self.assertIn('var generateMarkup = function (repo, placeholder) {', data)
        self.assertIn('var loadProject = function (repository_name) {', data)
        self.assertIn('var loadProjects = function () {', data)
        self.assertIn('var generateTags = function (repo_full_name, container_id) {', data)

    def test_css_files(self):
        data = self.get_asset('styles.css', 'text/css; charset=utf-8')

        self.assertIn('.markdown pre code {', data)
        self.assertIn('.markdown a.anchor {', data)
        self.assertIn('.mdl-list.condensed-list {', data)

