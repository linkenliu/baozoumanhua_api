'use strict';
// Declare app level module which depends on filters, and services
var app = angular.module('linkenBlogApp', ['linkenBlog.routes','xeditable','linkenBlog.filters','linkenBlog.directives']);


//angular.module("BsTableApplication", ["bsTable"]);

app.run(function(editableOptions) {
    editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});


