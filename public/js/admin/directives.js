'use strict';

/* Directives */

angular.module('linkenBlog.directives', [])
    .directive('fileInput', function ($parse) {
        return {
            restrict: "EA",
            template: "<input type='file' multiple accept='image/jpg,image/png' name='files' id='files' class='span5' />",
            replace: true,
            link: function (scope, element, attrs) {

                var modelGet = $parse(attrs.fileInput);
                var modelSet = modelGet.assign;
                var onChange = $parse(attrs.onChange);

                var updateModel = function () {
                    scope.$apply(function () {
                        modelSet(scope, element[0].files[0]);
                        onChange(scope);
                    });
                };

                element.bind('change', updateModel);
            }
        };
    })
    .
    directive('fileUpload', function ($parse) {
        return {
            restrict: "EA",
            template: "<input type='file' multiple accept='image/jpg,image/png' name='files' id='files2' class='span5' />",
            replace: true,
            link: function (scope, element, attrs) {

                var modelGet = $parse(attrs.fileUpload);
                var modelSet = modelGet.assign;
                var onChange = $parse(attrs.onChange);

                var updateModel = function () {
                    scope.$apply(function () {
                        modelSet(scope, element[0].files[0]);
                        onChange(scope);
                    });
                };

                element.bind('change', updateModel);
            }
        };
    });

