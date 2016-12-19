var showTopicImage = function(elem) {
    var imgsrc = elem;
    $.fancybox.open(
        [
            {
                maxWidth: 800,
                maxHeight: 600,
                fitToView: true,
                width: '70%',
                height: '70%',
                autoSize: true,
                closeClick: true,
                href: imgsrc,
            }
        ]
    );
}



