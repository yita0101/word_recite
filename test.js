function drag(obj) {
    //当鼠标在被拖拽元素上按下时，开始拖拽  onmousedown
    obj.onmousedown = function (event) {

        //设置box1捕获所有鼠标按下的事件
        /*
         * setCapture()
         *     - 只有IE支持，但是在火狐中调用时不会报错，
         *        而如果使用chrome调用，会报错
         */
        /*if(box1.setCapture){
            box1.setCapture();
        }*/
        obj.setCapture && obj.setCapture();


        event = event || window.event;
        //div的偏移量 鼠标.clentX - 元素.offsetLeft
        //div的偏移量 鼠标.clentY - 元素.offsetTop
        var ol = event.clientX - obj.offsetLeft;
        var ot = event.clientY - obj.offsetTop;


        //为document绑定一个onmousemove事件
        document.onmousemove = function (event) {
            event = event || window.event;
            //当鼠标移动时被拖拽元素跟随鼠标移动 onmousemove
            //获取鼠标的坐标
            var left = event.clientX - ol;
            var top = event.clientY - ot;

            //修改box1的位置
            obj.style.left = left + "px";
            obj.style.top = top + "px";

        };

        //为document绑定一个鼠标松开事件
        document.onmouseup = function () {
            //当鼠标松开时，被拖拽元素固定在当前位置  onmouseup
            //取消document的onmousemove事件
            document.onmousemove = null;
            //取消document的onmouseup事件
            document.onmouseup = null;
            //当鼠标松开时，取消对事件的捕获
            obj.releaseCapture && obj.releaseCapture();
        };

        /*
         * 当我们拖拽一个网页中的内容时，浏览器会默认去搜索引擎中搜索内容，
         *     此时会导致拖拽功能的异常，这个是浏览器提供的默认行为，
         *     如果不希望发生这个行为，则可以通过return false来取消默认行为
         *
         * 但是这招对IE8不起作用
         */
        return false;

    };
}

window.onload = function () {
    let input;
    let rihgt = document.querySelector(".right");

    function onBlurInput(input) {
        input.onblur = function () {
            save(input);
        };
    }

    function onKeyDownInput(input) {
        input.onkeydown = function (event) {
            if (event.keyCode == 13) {
                save(input);
            }
        };
    }


    rihgt.ondblclick = function (event) {
        event = event || window.event;


        input = document.createElement("input");

        let x = event.offsetX;
        let y = event.offsetY;

        input.style.position = "absolute";
        input.type = "text";

        input.style.left = x + "px";
        input.style.top = y + "px";

        rihgt.appendChild(input);

        input.focus();

        //对input失去焦点绑定
        onBlurInput(input);

        //对input键盘按下绑定
        onKeyDownInput(input);


    }


    function save(input) {

        let span = document.createElement("span");

        //获取input的文本，并判断
        if (!/^\s*$/.test(input.value)) {
            span.innerText = input.value;
            span.style.position = "absolute";

            span.style.left = input.style.left;
            span.style.top = input.style.top;
            span.style.backgroundColor = "red";

            input.parentNode.replaceChild(span, input);

            //span绑定双击事件
            span.ondblclick = function (event) {

                event = event || window.event;

                let newInput = document.createElement("input")
                newInput.type = "text";
                newInput.style.position = "absolute";
                newInput.style.left = span.style.left;
                newInput.style.top = span.style.top;
                newInput.value = span.innerText;

                onBlurInput(newInput);

                onKeyDownInput(newInput);

                span.parentNode.replaceChild(newInput, span);


                newInput.focus();

                event ? event.cancelBubble = true : event.stopPropagation();
            }

            //对span拖拽实现
            drag(span);


        } else {
            input.parentNode.removeChild(input);
        }
    }
}
