function myload(){
   layer.load(0);

}
function myclose(){
    layer.close(layer.load(0));
}

function myalert(icon,msg,setTiemLong){
    layer.alert(msg, {
        icon: icon,
        skin: 'layer-ext-moon'
    })
}

function mytips(content,elem){
    layer.tips(content, elem);
}

function myopenMedia(url){
    layer.open({
        type: 2,
        title: false,
        area: ['930px', '660px'],
        shade: 0.8,
        closeBtn: 0,
        shadeClose: true,
        content: url
    });
}

/**
 *获取字符串字节数
 */
function GetStringByteLength(val){

    var Zhlength=0;// 全角
    var Enlength=0;// 半角

    for(var i=0;i<val.length;i++){
        if(val.substring(i, i + 1).match(/[^\x00-\xff]/ig) != null)
            Zhlength+=1;
        else
            Enlength+=1;
    }
    // 返回当前字符串字节长度
    return (Zhlength*2)+Enlength;
}

