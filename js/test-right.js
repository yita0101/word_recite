window.loadingRight = function () {
    window.flag = 0
    window.indexSpan = 1
    let input
    let right = document.querySelector(".right")
    //创建一个地图，是描绘所有span的，索引为0是它的父元素
    window.map = [right]
    // word_list=document.querySelector(".word_list")
    // let e = document.querySelector("body > div > div.right > input[type=text]");
    //!todo 按delete删除
    //!todo 不能移过规定区域
    //!todo 数据展示
    //!todo 按键与指定单词监听
    //!todo 到最后一个不会收框


    right.ondblclick = function (event) {
        event = event || window.event;

        event.cancelBubble = true

        input = document.createElement("input")

        let x = event.offsetX;
        let y = event.offsetY;

        newInput(x, y, right, false)

        // input.style.position = "absolute";
        // input.type = "text";
        //
        //
        // input.style.left = x + "px";
        // input.style.top = y + "px";
        //
        // right.appendChild(input);
        //
        // input.focus();
        //
        //
        // //对input失去焦点绑定
        // onBlurInput(input);
        //
        // //对input键盘按下绑定,会同时执行鼠标事件的同时会触发失去焦点事件
        // onKeyDownInput(input);

    }


}

function onBlurInput(input) {
    input.onblur = function () {
        // console.log(1);
        if (flag == 1) {
            return;
        }
        if (!input.value || checkedRight(input)) {
            save(input)
        } else {
            input.focus()
        }

    };
}

function onKeyDownInput(input) {
    input.onkeypress = function (event) {

        event.cancelBubble = true
        // console.log(event.keyCode)
        //enter
        if (event.keyCode == 13 && input.value) {
            //checkedRight效验单词，这里同时也实现了，向下或向上的滑动，根据shiftKey
            if (checkedRight(input, event.shiftKey)) {
                flag = 1;
                let div = input.parentNode;
                let left = input.offsetLeft;
                let top = input.offsetTop;

                //在这里移除了input所以不能获取它的parentNode了，同时定位的偏移量也没有了
                save(input);

                //在这之前要进入review模式

                intoReviewModel([left, top, div, true])


                flag = 0;


            } else {
                let warn_str = "输入错误，请重新输入！！！"
                let warnDiv = document.createElement("div");

                warnDiv.innerText = warn_str

                // console.log(this.offsetTop,this.offsetLeft,this)
                warnDiv.style.left = this.offsetLeft + "px"
                warnDiv.style.top = this.offsetTop - 26 + "px"

                left.addClass(warnDiv, "warn_input")

                this.parentNode.appendChild(warnDiv)

                setTimeout(() => {
                    this.parentNode.removeChild(warnDiv)
                }, 400)
            }

            //空格
        } else if (event.keyCode === 32) {
            this.value = '';
            return false
        }
    };
}

function save(input) {

    let span = document.createElement("span");

    //获取input的文本，并判断
    if (!/^\s*$/.test(input.value)) {
        span.innerText = input.value;
        span.style.position = "absolute";

        span.style.left = input.style.left;
        span.style.top = input.style.top;

        span.setAttribute("index", indexSpan++)

        left.addClass(span, "unit")


        map.push(span)
        let rightDom = input.parentNode
        rightDom.replaceChild(span, input);


        //span绑定双击事件
        // span.ondblclick = function (event) {
        //
        //     event = event || window.event;
        //
        //     let newInput = document.createElement("input")
        //     newInput.type = "text";
        //     newInput.style.position = "absolute";
        //     newInput.style.left = span.style.left;
        //     newInput.style.top = span.style.top;
        //     newInput.value = span.innerText;
        //
        //     span.parentNode.appendChild(newInput);
        //
        //     onBlurInput(newInput);
        //
        //     onKeyDownInput(newInput);
        //
        //
        //     span.parentNode.replaceChild(newInput,span);
        //
        //
        //
        //     newInput.focus();
        //     event ? event.cancelBubble = true : event.stopPropagation();
        // }

        span.ondblclick = function (event) {
            // toggleClass(this,"select")
            event.cancelBubble = true
        };

        // span.onclick= function (event) {
        // };

        span.oncontextmenu = function (event) {

            let MenuDom = getMenu(event)


            span.appendChild(MenuDom)

            return false
        };

        //对span拖拽实现
        drag(span);


    } else {
        input.parentNode.removeChild(input);
    }
}

function checkedRight(input, isShift) {
    // word_list=document.querySelector(".word_list");
    let word_list = left.word_list;
    // console.log(word_list)
    // console.log(word_list.current_word_index)
    // console.log(word_list.children[word_list.current_word_index].current_word_index)

    // alert("请输入单词不正确，请重新输入")
    //真正的比较
    if (input.value.toLowerCase() === word_list.children[word_list.current_word_index].children[0].innerText.toLowerCase()) {
        // 必要判断
        if (word_list.current_word_index < word_list.children.length - 1) {
            if (isShift) {
                left.last_word(word_list);
            } else {
                left.next_word(word_list)
            }
        }

        return true;
    } else {

        // alert("输入匹配，请重新输入")
        //!TODO如果使用alert会循环调用本身，不知道什么原因同时也不推荐使用这种方式
        return false;
    }
}

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

function getRandomNum() {
//        map这个对象是一个数组，第一个为索引为整个装载span元素的父元素dom，存在window中
    //!todo重点重构
    let rightDom = map[0]
    // console.log(rightDom.clientHeight,rightDom.clientWidth)
    // console.log(rightDom.clientHeight-31,rightDom.clientWidth-150)
    let maxH = Math.random() * (rightDom.clientHeight - 31);
    let maxW = Math.random() * (rightDom.clientWidth - 150);
    // console.log(maxH,maxW)
    return {maxW, maxH}
}

function intoReviewModel(position) {
    window.TIME = 1000
    window.index = 1
    let tempIndex1
    left.addClass(map[index++], "review_word")
    document.onkeypress = function (event) {
        if (event.keyCode === 32) {
            left.removeClass(map[index - 1], "review_word");

            tempIndex1 = index
            left.addClass(map[index++], "review_word");
            window["hasOnKey" + tempIndex1] = true
            console.log(111)
            review(index, --index, position)

            return false;
        }
    };

    setTimeout(function () {
        if (!window["hasOnKey" + tempIndex1]) {
            left.removeClass(map[index - 1], "review_word");
            left.addClass(map[index++], "review_word");

            review(index, --index, position)


        }

    }, TIME);


}

function review(index, tempIndex2, position) {
    if (map.length ===2) {
        newInput(position[0], position[1], position[2], position[3])
        return
    }
    document.onkeypress = function (event) {
        if (event.keyCode === 32) {
            left.removeClass(map[index - 1], "review_word")
            tempIndex2 = index
            window["hasOnKey" + tempIndex2] = true
            left.addClass(map[index++], "review_word")


            if (index < map.length) {
                review(index, index--, position);
            } else {
                let tempIndex3
                document.onkeypress = function (event) {
                    if (event.keyCode === 32) {
                        left.removeClass(map[index - 1], "review_word");

                        tempIndex3 = index
                        left.addClass(map[index], "review_word");
                        window["hasOnKey" + tempIndex3] = true

                        newInput(position[0], position[1], position[2], position[3])
                        return false;
                    }
                };

                setTimeout(function () {
                    if (!window["hasOnKey" + tempIndex3]) {
                        left.removeClass(map[index - 1], "review_word");
                        left.addClass(map[index], "review_word");

                        newInput(position[0], position[1], position[2], position[3])
                    }

                }, TIME);

            }
            return false;
        }
    };

    setTimeout(function () {
        if (!window["hasOnKey" + tempIndex2]) {

            left.removeClass(map[index - 1], "review_word");
            left.addClass(map[index++], "review_word")

            if (index < map.length) {
                review(index, index--, position);
            } else {

                let tempIndex3
                document.onkeypress = function (event) {
                    if (event.keyCode === 32) {
                        left.removeClass(map[index - 1], "review_word");

                        tempIndex3 = index
                        left.addClass(map[index], "review_word");
                        window["hasOnKey" + tempIndex3] = true

                        newInput(position[0], position[1], position[2], position[3])
                        return false;
                    }
                };

                setTimeout(function () {
                    if (!window["hasOnKey" + tempIndex3]) {
                        left.removeClass(map[index - 1], "review_word");
                        left.addClass(map[index], "review_word");

                        newInput(position[0], position[1], position[2], position[3])


                    }

                }, TIME);

            }
        }

    }, TIME);

}

/**
 * 根据偏移量创建新的input
 * !!!请确保parentNode开启了定位
 * @param left 相对于最近开启定位的祖元素的左边偏移量
 * @param top  相对于最近开启定位的祖元素的右边偏移量
 * @param parentNode 那个祖元素元素
 * @param hasLast 是否有上一个元素，有就会根据上一个元素发生偏移
 */

function newInput(left, top, parentNode, hasLast) {
    // console.log(left,top)

    let newInput = document.createElement("input");

    let offsetLeft;
    // let offsetTop =offsetLeft= Math.random();
    let offsetTop = offsetLeft = 40;
    newInput.type = "text";
    newInput.style.position = "absolute";

    if (hasLast) {
        let offset = getRandomNum()
        newInput.style.left = (offset.maxW) + "px";
        newInput.style.top = (offset.maxH) + "px";

    } else {
        newInput.style.left = (left) + "px";
        newInput.style.top = (top) + "px";
    }


    onBlurInput(newInput);

    onKeyDownInput(newInput);

    parentNode.appendChild(newInput);

    newInput.focus();
}

function deleteUnit() {

}

function getMenu(eventParent) {
    // console.log(event)
    // console.log(event.offsetX,event.offsetY)
    // console.log(event.clientX,event.clientY)
    if (!window.menuRightClick) {

        Menu_dom = document.createElement("div");


        Menu_dom.style.position = "absolute";
        Menu_dom.style.left = eventParent.offsetX + "px";
        Menu_dom.style.top = eventParent.offsetY + "px";

        let selectMenuDom = document.createElement("div");

        selectMenuDom.innerText = "删除";

        selectMenuDom.onclick = function (event) {
            // console.log(eventParent.srcElement.getAttribute("index"),eventParent.srcElement)
            // console.log(eventParent.srcElement.parentNode, eventParent.srcElement)
            eventParent.srcElement.parentNode.removeChild(eventParent.srcElement)
            let current_index=eventParent.srcElement.getAttribute("index")
            map.splice(parseInt(current_index),1)
        };

        selectMenuDom.onmouseleave = function (event) {
            Menu_dom.parentNode.removeChild(Menu_dom)
        };

        Menu_dom.appendChild(selectMenuDom);

        left.addClass(selectMenuDom, "menu_select")
        left.addClass(Menu_dom, "menu_right_click");

        // event.clientX
        window.menuRightClick = Menu_dom;
    } else {

        menuRightClick.style.left = eventParent.offsetX + "px";
        menuRightClick.style.top = eventParent.offsetY + "px";
        menuRightClick.children[0].onclick = function (event) {

            // console.log(eventParent.srcElement.getAttribute("index"),eventParent.srcElement)
            // console.log(eventParent.srcElement.parentNode, eventParent.srcElement)
            eventParent.srcElement.parentNode.removeChild(eventParent.srcElement)
            let current_index=eventParent.srcElement.getAttribute("index")
            map.splice(parseInt(current_index),1)
        };
        menuRightClick.children[0].onmouseleave = function (event) {
            menuRightClick.parentNode.removeChild(menuRightClick)

        };
    }
    return window.menuRightClick;
}

function sleep(milliSeconds) {
    let StartTime = new Date().getTime();
    let i = 0;
    while (new Date().getTime() < StartTime + milliSeconds) {
        if (window.isCancalSleep) {
            break;
        }
    }
    ;

}