'use strict';

/* Controllers */


angular.module('linkenBlog.controllers', [])
    .controller('LogoutCtrl', ['$scope', '$location', ($scope, $location)=> {
        window.location.href = '/admin/layout';
    }])
    .controller('HuserCtrl', ['$scope', '$location', '$http', ($scope, $location, $http) => {
       let getHuser = ()=> {
           $http.get('/admin/v1/huser').
               success((data) => {
                   if (data.success) {
                       $scope.huserList = data.huserList;
                   } else {
                       myalert(2, '加载失败');
                   }
               });
       };
        getHuser();
    }])
    .controller('UserCtrl', ['$scope', '$location', '$http', '$q', '$filter', '$routeParams', ($scope, $location, $http, $q, $filter, $routeParams) => {
        $scope.searchText = '';
        let getUser = ()=> {
            myload();
            $http.get('/admin/v1/userList?searchText=' + $scope.searchText).
                success((data, status, headers, config)=> {
                    if (data.success) {
                        $scope.userList = data.userList;
                        myclose();
                    } else {
                        myalert(2, '加载失败');
                    }
                });
        };
        getUser();
        $scope.addUser = () => {
            $scope.inserted = {password1: '', sex: 1, state: 1};
            $scope.userList.push($scope.inserted);
        };
        $scope.saveUser = (_id, user, rowform) => {
            if (_id) user._id = _id;
            let d = $q.defer();
            $http.post('/admin/v1/saveUser', user).success((res)=> {
                if (res.success) { // {result: "result"}
                    d.resolve();
                    getUser();
                    return true;
                } else { // {result: "Server error!"}
                    rowform.$setError("username", res.result);
                    d.reject(res.result)
                }
            }).error((e)=> {
                rowform.$setError("username", "server error");
                d.reject('Server error!');
            });
            return d.promise;
        };
        $scope.deleteUser = (_id, username) => {
            $scope.modal_title = '删除用户';
            $scope.delete_id = _id;
            $scope.delete_title = '[' + username + ']';
            $("#deleteModal").toggle();
        };
        $scope.destroy = ()=> {
            myload();
            let _id = $scope.delete_id;
            $http.delete('/admin/v1/user/' + _id).
                success((data)=> {
                    if (data.success) {
                        $("#deleteModal").hide();
                        getUser();
                        myclose();
                    } else {
                        $("#deleteModal").hide();
                        myalert(2, '删除失败');
                    }
                });

        };
        $scope.searchUser = ()=> {
            if (GetStringByteLength($scope.searchText) > 3 || !$scope.searchText) {
                getUser();
            }
        };
        $scope.checkUserName = (_id, username)=> {
            if (!username) {
                return "请填写用户名";
            } else if (username.length < 4) {
                return "长度不能小于4个字符";
            } else if (!/^[\w@_-]+$/.test(username)) {
                return "只能包含字母数字和@_-";
            } else {
                var d = $q.defer();
                $http.post('/admin/v1/checkusername', {_id: _id, username: username}).success((data)=> {
                    if (data.success) { // {result: "OK"}
                        d.resolve()
                    } else { // {result: "用户名已经被使用"}
                        d.resolve(data.message);
                    }
                }).error((e)=> {
                    d.reject('Server error!');
                });
                return d.promise;
            }
        };
        $scope.checkEmail = (_id, email)=> {
            if (!email) { //can be blank
                return true;
            } else if (!/^\w+@[0-9a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) {
                return "Email格式不正确!";
            } else {
                var d = $q.defer();
                $http.post('/admin/v1/checkemail', {_id: _id, email: email}).success((data)=> {
                    if (data.success) {
                        d.resolve()
                    } else {
                        d.resolve(data.message);
                    }
                }).error((e)=> {
                    d.reject('Server error!');
                });
                return d.promise;
            }
        };
        $scope.sexs = [
            {value: 1, text: "男"},
            {value: 0, text: "女"}
        ];
        $scope.states = [
            {value: 1, text: "正常"},
            {value: 0, text: "冻结"}
        ];
        $scope.showSex = (item) => {
            if (!item) return;
            var selected = $filter('filter')($scope.sexs, {value: item.sex});
            return (item && selected.length) ? selected[0].text : 'Not set';
        };
        $scope.showState = (item) => {
            if (!item) return;
            var selected = $filter('filter')($scope.states, {value: item.state});
            return (item && selected.length) ? selected[0].text : 'Not set';
        };
        $scope.showPlaceHolder = (userid) => {
            if (userid) return '不想更改就空着';
            else return "请输入密码";
        };

        $scope.checkPassword = (password, userid)=> {
            if (!password) {
                if (userid) {
                    $scope.password = password;
                    return true;
                }
                else return "不能为空";
            } else if (password.length < 4) {
                return "长度不能小于4个字符";
            } else if (!/^[\w@_-]+$/.test(password)) {
                return "只能包含字母数字和@_-";
            } else {
                $scope.password = password;
                return true;
            }
        };
        $scope.checkPassword1 = (password)=> {

            if ($scope.password != password) {
                return "两次输入的密码不匹配";
            } else {
                return true;
            }
        };
        $scope.showModal = (modal)=> {
            $("#" + modal).toggle();
        };
        $scope.showimpower = (_id, username)=> {
            $("#impowerModal").show();
        };


    }])
    .controller('TopicCtrl', ['$scope', '$location', '$http', '$filter', '$routeParams', '$sce', '$q', ($scope, $location, $http, $filter, $routeParams, $sce, $q) => {
        $scope.order = '';
        $scope.searchText = '';
        $scope.topic_type = '';
        $scope.sort = '';
        $scope.pageSizes = [
            {value: '20', text: '20'},
            {value: '30', text: '30'},
            {value: '50', text: '50'},
            {value: '100', text: '100'},
            {value: '200', text: '200'}
        ];
        $scope.pageSize = $scope.pageSizes[0].value;
        if (!$scope.pageIndex) {
            $scope.pageIndex = 1;
        }
        let getTopic = ()=> {
            myload();
            $http.get('/admin/v1/topic?pageSize=' + $scope.pageSize + '&pageIndex=' + $scope.pageIndex + "&searchText=" + $scope.searchText + "&order=" + $scope.order + "&sort=" + $scope.sort + "&topic_type=" + $scope.topic_type).
                success(function (data, status, headers, config) {
                    $scope.topicList = data.topicList;
                    $scope.topicType = data.topicType;
                    $scope.totalCount = data.totalCount;
                    $scope.totalPage = data.totalPage;
                    $scope.currentPage = data.currentPage;
                    myclose();
                });
        };
        getTopic();
        $scope.states = [
            {value: 1, text: "正常"},
            {value: 0, text: "冻结"}
        ];
        $scope.showState = (item)=> {
            if (!item) return;
            let selected = $filter('filter')($scope.states, {value: item.state});
            return (item && selected.length) ? selected[0].text : 'Not set';
        };
        $scope.topicNext = ()=> {
            let pageIndex = parseInt($scope.currentPage) + parseInt(1);
            $scope.pageIndex = pageIndex;
            getTopic();
        };
        $scope.topicPrev = ()=> {
            let pageIndex = parseInt($scope.currentPage) - parseInt(1);
            $scope.pageIndex = pageIndex;
            getTopic();
        };

        $scope.changePageSize = ()=> {
            let pageSize = $scope.pageSize;
            $scope.pageSize = pageSize;
            getTopic();
        };
        $scope.checkPageIndex = ()=> {
            let reg = new RegExp("^[0-9]*$");
            if (!reg.test($scope.pageIndex)) {
                $scope.pageIndex = 1;
            }
        };
        $scope.goTopic = ()=> {
            $scope.pageIndex = $scope.pageIndex;
            getTopic();
        };

        $scope.searchChannel = ()=> {
            if (GetStringByteLength($scope.searchText) > 3 || !$scope.searchText) {
                getTopic();
            }
        };
        $scope.order_class = 'icon-sort-down';
        $scope.order_class2 = 'icon-sort-down';
        $scope.changeOrder = (order)=> {
            $scope.order = order;
            if ($scope.sort == 1) {
                if (order == 'topic_id')
                    $scope.order_class = 'icon-sort-down';
                if (order == 'release_date') {
                    $scope.order_class2 = 'icon-sort-down';
                }
                $scope.sort = -1;
            } else {
                if (order == 'topic_id')
                    $scope.order_class = 'icon-sort-up';
                if (order == 'release_date') {
                    $scope.order_class2 = 'icon-sort-up';
                }
                $scope.sort = 1
            }
            getTopic();
        };

        $scope.deleteTopic = (_id, title) => {
            $scope.modal_title = '删除帖子';
            $scope.delete_id = _id;
            $scope.delete_title = '[' + title + ']';
            $("#deleteModal").toggle();
        };

        $scope.showModal = (modal)=> {
            $("#" + modal).toggle();
        };
        $scope.destroy = ()=> {
            let _id = $scope.delete_id;
            $http.delete('/admin/v1/topic/' + _id).
                success((data)=> {
                    if (data.success) {
                        $("#deleteModal").hide();
                        getTopic();
                    } else {
                        $("#deleteModal").hide();
                        myalert(2, '删除失败');
                    }
                });

        };
        $scope.saveTopic = (_id, topic, rowform)=> {
            if (_id) topic._id = _id;
            let d = $q.defer();
            $http.post('/admin/v1/saveTopic', topic).success((data)=> {
                if (data.success) { // {result: "result"}
                    d.resolve();
                    getTopic();
                    return true;
                } else { // {result: "Server error!"}
                    rowform.$setError("title", data.message);
                    d.reject(data.message);
                    return false;
                }
            }).error((e)=> {
                rowform.$setError("title", "server error");
                d.reject('Server error!');
            });
            return d.promise;
        };
        $scope.changeTopicType = ()=> {
            getTopic();
        };

    }])
    .controller('WallCtrl', ['$scope', '$location', '$http', ($scope, $location, $http) => {
        $scope.searchText = '';
        let getTopic = ()=> {
            myload();
            $http.get('/admin/v1/videowall?searchText=' + $scope.searchText).
                success((data, status, headers, config) => {
                    if (data.success) {
                        $scope.topicList = data.topicList;
                        myclose();
                    } else {
                        myalert('2', data.message);
                    }
                });
        };
        getTopic();
        $scope.searchTopic = ()=> {
            if (GetStringByteLength($scope.searchText) > 3 || !$scope.searchText) {
                getTopic();
            }
        };
        $scope.showVideo = (url)=> {
            myopenMedia(url);
        };


    }])
    .controller('storyCtrl', ['$scope', '$location', '$http', '$filter', '$q', ($scope, $location, $http, $filter, $q) => {
        $scope.searchText = '';
        $scope.order = '';
        $scope.sort = '';
        var storyList = ()=> {
            myload();
            $http.get('/admin/v1/storyList?searchText='+$scope.searchText+"&order="+$scope.order+"&sort="+$scope.sort).
                success((data)=> {
                    if (data.success) {
                        $scope.storyList = data.storyList;
                        myclose();
                    } else {
                        myclose();
                        myalert(2, data.message);
                    }
                });
        };

        storyList();

        $scope.showAddStory = ()=> {
            $("#showAddStoryModal").toggle();
        };
        $scope.showModal = (mid)=> {
            $("#" + mid).toggle();
        };
        $scope.saveStory = ()=> {
            if (!$scope.title) {
                myalert('2', '标题不能为空.');
                return;
            }
            myload();
            var formData = new FormData($('#frmSaveStory')[0]);
            $http.post('/admin/v1/saveStory', formData, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }).
                success((data) => {
                    if (data.success) {
                        $("#showAddStoryModal").toggle();
                        storyList();
                        myclose();
                    } else {
                        myclose();
                        myalert('2', data.message);
                    }
                });
        };

        $scope.states = [
            {value: 1, text: "正常"},
            {value: 0, text: "冻结"}
        ];
        $scope.showState = (item) => {
            if (!item) return;
            var selected = $filter('filter')($scope.states, {value: item.state});
            return (item && selected.length) ? selected[0].text : 'Not set';
        };
        $scope.addStory = () => {
            $scope.inserted = {state: 1, view_count: 1, collect_count: 1};
            $scope.storyList.push($scope.inserted);
        };
        $scope.deleteStory = (_id, title)=> {
            $scope.modal_title = '删除小故事';
            $scope.delete_id = _id;
            $scope.delete_title = '[' + title + ']';
            $("#deleteModal").toggle();
        };
        $scope.destroy = ()=> {
            myload();
            let _id = $scope.delete_id;
            $http.delete('/admin/v1/story/' + _id).
                success((data)=> {
                    if (data.success) {
                        $("#deleteModal").hide();
                        myclose();
                        storyList();
                    } else {
                        $("#deleteModal").hide();
                        myclose();
                        myalert(2, '删除失败');
                    }
                });
        };

        $scope.searchStory = ()=>{
            if (GetStringByteLength($scope.searchText) > 3 || !$scope.searchText) {
                storyList();
            }
        };
        $scope.order_class = 'icon-sort-down';
        $scope.order_class2 = 'icon-sort-down';
        $scope.changeOrder = (order)=> {
            $scope.order = order;
            if ($scope.sort == 1) {
                if (order == 'story_id')
                    $scope.order_class = 'icon-sort-down';
                if (order == 'create_date') {
                    $scope.order_class2 = 'icon-sort-down';
                }
                $scope.sort = -1;
            } else {
                if (order == 'story_id')
                    $scope.order_class = 'icon-sort-up';
                if (order == 'create_date') {
                    $scope.order_class2 = 'icon-sort-up';
                }
                $scope.sort = 1
            }
            storyList();
        };

        $scope.showEditStory = (_id)=>{
            $http.get('/admin/v1/findOneStory?_id='+_id).
                success((data) => {
                    if (data.success) {
                        $("#showEditStoryModal").toggle();
                        $scope.story = data.story;
                    } else {
                        myalert('2', data.message);
                    }
                });
        };
        $scope.editStory = ()=>{
            $http.post('/admin/v1/editStory',$scope.story).
                success((data) => {
                    if (data.success) {
                        $("#showEditStoryModal").toggle();
                        storyList();
                    } else {
                        myalert('2', data.message);
                    }
                });
        };
        $scope.uploadStoryCoverFile = function(_this){
            var formData = new FormData();
            $.each($('#files')[0].files, function (i, file) {
                formData.append('files', file);
            });
            $.ajax({
                url: '/admin/v1/uploadForQiniu',
                type: 'POST',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.success){
                        _this.story.cover = data.qiniu_image;
                    }else{
                        myalert('2',data.message);
                    }
                },
                error: function () {
                    myalert('2','与服务器通信发生错误');
                }
            });
        };
        $scope.uploadStoryImageurlFile = function(_this){
            var formData = new FormData();
            $.each($('#files2')[0].files, function (i, file) {
                formData.append('files', file);
            });
            $.ajax({
                url: '/admin/v1/uploadForQiniu',
                type: 'POST',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.success){
                        _this.story.image_url = data.qiniu_image;
                    }else{
                        myalert('2',data.message);
                    }
                },
                error: function () {
                    myalert('2','与服务器通信发生错误');
                }
            });
        }
    }]);

