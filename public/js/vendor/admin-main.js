require.config({
    paths: {
        jquery: ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min", '../jquery-2.1.4.min'] //配置第三方库，不能加.js后缀
    }
});
require(["jquery"], function ($) {
    $(function () {

        var editor_file_upload_this = '';
        $(".avatar").on('change',function(){
            editor_file_upload_this = $(this);
            var id = $(this).attr('data-id');
            var formData = new FormData();
            formData.append('_id', id);
            formData.append('model', 'user');
            $.each($(editor_file_upload_this)[0].files, function (i, file) {
                formData.append('files', file);
            });
            $.ajax({
                url: '/admin/v1/upload',
                type: 'POST',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.success){
                        editor_file_upload_this.parent().find('img').attr('src',data.avatar);
                    }else{
                        editor_file_upload_this.parent().find('.upload_error').text(data.message);
                        setTimeout(function(){
                            editor_file_upload_this.parent().find('.upload_error').text('');
                        },3000);
                    }
                },
                error: function () {
                    editor_file_upload_this.parent().find('.upload_error').text(data.message);
                    $("#upload_error").text('与服务器通信发生错误!');
                    setTimeout(function(){
                        editor_file_upload_this.parent().find('.upload_error').text('');
                    },3000);
                }
            });
        });

    });
});

