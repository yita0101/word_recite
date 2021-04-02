window.loadingRight = function () {
    //在输入单词正确后按下enter时会触发失去焦点事件，但按键事件先执行
    // 由于js是单线程的所以按键事件执行了一半并被中断了,会出现bug但忘了!todo
    //flag记录按照事件是否在执行,0表示不在，1表示在
    window.flag = 0
    //每添加一个单词span，就会为这个span添加一个索引
    window.indexSpan = 1
    let input
    let right = document.querySelector(".right")

    right.style.height=window.innerHeight+"px"
    //存放所有的span，索引为0是他们的父元素
    window.map = [right]
    window.right={}

    //!todo 按delete删除
    //!todo 不能移过规定区域
    //!todo 单词是recite的单词显示中文，其他的显示音标
    //!todo -list 后端那一套包括数据，大概要3___0天吧。。。
    right.ondblclick = function (event) {

        event.cancelBubble = true

        input = document.createElement("input")

        let x = event.offsetX;
        let y = event.offsetY;

        newInput(x, y, right, true)



    }
    //shift+空格下一个单词
    //在复习模式中按空格可以切换单词，shift空格键中文提示
    document.addEventListener('keypress',function (event) {

        if (event.shiftKey && event.keyCode === 32) {
            let reviewWordDom = document.querySelector(".review_word");
            //根据右边span每次设置的listIndex获取对应左边的单词
            if (reviewWordDom) {
                let meaningMsg=left.word_list.children[reviewWordDom.getAttribute("listIndex")].querySelector(".meaning").innerText;
                alert_msg(meaningMsg,reviewWordDom,false)
            }
        }

        //阻止空格默认事件，双重保险
        event.preventDefault();
        return false
    },);


}

function onBlurInput(input) {
    input.onblur = function () {
        //在输入单词正确后按下enter时会触发失去焦点事件，但按键事件先执行
        // 由于js是单线程的所以按键事件执行了一半并被中断了,会出现bug但忘了!todo
        // console.log(1);
        //
        if (flag === 1) {
            return;
        }
        if (!input.value || checkedRight(input)) {
            //!toThink 输入框失去焦点，播放一次音标,考虑
            // window.left.playAudio(document.querySelector(".recite>.word").innerText)
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
        //enter input中不为空
        if (event.keyCode === 13 && input.value) {
            //checkedRight效验单词，这里同时也实现了，向下或向上的滑动，根据shiftKey
            if (checkedRight(input, event.shiftKey)) {
                flag = 1;
                let div = input.parentNode;
                let left = input.offsetLeft;
                let top = input.offsetTop;

                //在这里移除了input所以不能获取它的parentNode了，同时定位的偏移量也没有了
                //这是将输入框中的单词变成模块span
                save(input,event.shiftKey);

                //在这之前要进入review模式
                //传入position是最后要调用一个函数然后用的参数。。。
                intoReviewModel([left, top, div, false])


                flag = 0;


            } else {
                window.left.playAudio(document.querySelector(".recite>.word").innerText)

                let warn_str = "输入错误，请重新输入！！！"

                alert_msg(warn_str,this,true)

            }

            //空格
        } else if (event.keyCode === 32) {
            //!toThink
            window.left.playAudio(document.querySelector(".recite>.word").innerText)
            this.value = '';
            return false
        }
    };
}

/**
 *
 * @param input
 * @param isShift 是否使用了Shift，默认undefined，如果shift单词是向上移动的，反之亦然
 */
function save(input,isShift) {

    let span = document.createElement("span");

    //获取input的文本，并判断
    if (!/^\s*$/.test(input.value)) {
        span.innerText = input.value;
        span.style.position = "absolute";

        span.style.left = input.style.left;
        span.style.top = input.style.top;

        span.setAttribute("index", indexSpan++)

        //这个索引寻找中文
        let tempListIndex=parseInt(document.querySelector(".recite").getAttribute("listIndex"))
        if (isShift) {
            if (!tempListIndex === 0) {
                span.setAttribute("listIndex", tempListIndex + 1);
            } else {
                span.setAttribute("listIndex", tempListIndex);
            }
        } else {
            //注意这里的写法,没有括号就被坑了
            if (!(tempListIndex === left.word_list.length)) {
                span.setAttribute("listIndex", tempListIndex - 1);
            } else {
                span.setAttribute("listIndex", tempListIndex);
            }
        }

        left.addClass(span, "unit")


        map.push(span)
        let rightDom = input.parentNode
        rightDom.replaceChild(span, input);




        span.ondblclick = function (event) {
            // toggleClass(this,"select")
            event.cancelBubble = true
        };

        // span.onclick= function (event) {
        // };
        //绑定右击菜单，实现了删除功能
        span.oncontextmenu = function (event) {

            let MenuDom = getMenu(event)


            span.appendChild(MenuDom)

            return false
        };

        //对span拖拽实现
        drag(span);

        //点击播放
        span.onclick = function () {
            window.left.playAudio(span.innerText)
            console.log(this.getAttribute("listIndex"))
            let meaningMsg=left.word_list.children[this.getAttribute("listIndex")].querySelector(".meaning").innerText
            alert_msg(meaningMsg,this,false)
        };




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
        //如果按下shift往上移动单词
        if (word_list.current_word_index < word_list.children.length - 1) {
            if (isShift) {
                left.last_word(word_list);
            } else {
                left.next_word(word_list)
            }
        }

        return true;
    } else {


        //鼠标移出，如果输入错误提示
        window.left.playAudio(document.querySelector(".recite>.word").innerText)
        alert_msg("输入错误，请重新输入！！！",input,true)
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
    let inputWidth=150
    // let inputHeight=31

    let maxW=rightDom.clientWidth - inputWidth
    let maxH=rightDom.clientHeight - map[1].clientHeight
    let randomW = Math.random() * (maxW);
    let randomH = Math.random() * (maxH);

    // console.log(maxH,maxW)


    let countCondition='false'
    for (let i = 1; i <map.length; i++) {
        //这里的变量写多了，不想改了。。。

        let leftDot=map[i].offsetLeft-inputWidth<0?0:map[i].offsetLeft-inputWidth

        let topDot=map[i].offsetTop-map[i].clientHeight<0?0:map[i].offsetTop-map[i].clientHeight
        // console.log(topDot)

        let borderW=leftDot===0?map[i].offsetLeft+map[i].clientWidth:leftDot+map[i].clientWidth+inputWidth

        borderW=borderW>maxW?maxW:borderW

        let borderH=topDot===0?map[i].offsetTop+map[i].clientHeight:topDot+map[i].clientHeight*2
        // console.log(borderH)

        borderH=borderH>maxH?maxH:borderH

        // console.log(borderH)

        countCondition+="||"+`randomW > ${leftDot} && randomW < ${(borderW)} && randomH >${topDot} && randomH < ${(borderH)}`

    }
    // console.log(countCondition)
    let count=0
    // console.time("test")
    while (eval(countCondition)) {
        if (++count>2222) {
            console.log('无空位')
            break;
        }
        //这里没有办法优化了，会有偏差的，最后导致结果还是不准确
        //优化的最好建议是发一个异步请求，让服务器处理,传过的countCondition是一个字符串条件，直接在java中嵌入js的代码
        randomW = Math.random() * (maxW);
        randomH = Math.random() * (maxH);
    }
    // console.timeEnd("test")
    // console.log(count)
    // console.log(eval(countCondition),randomW,randomH)
    return {randomW, randomH};
}


//由于单线程，所以只能以事件和延时的方式推进执行
function intoReviewModel(position) {
    window.TIME = 2000
    window.index = 1
    window.nextWordKeyCode=32
    let tempIndex1

    left.playAudio(map[index].innerText)

    left.addClass(map[index++], "review_word")
    document.onkeypress = function (event) {
        if (!event.shiftKey&&event.keyCode === window.nextWordKeyCode) {

            left.removeClass(map[index - 1], "review_word");

            tempIndex1 = index


            map[index]&&left.playAudio(map[index].innerText)

            left.addClass(map[index++], "review_word");
            window["hasOnKey" + tempIndex1] = true


            review(index, index, position)

            return false;
        }
    };

    setTimeout(function () {
        if (!window["hasOnKey" + tempIndex1]) {

            left.removeClass(map[index - 1], "review_word");


            map[index]&&left.playAudio(map[index].innerText)

            left.addClass(map[index++], "review_word");

            review(index,index, position)

        }
        window["hasOnKey" + tempIndex1]=null
    }, window.TIME);


}

function review(index, tempIndex2, position) {
    // console.log(map)
    // console.log(index,tempIndex2)
    if (map.length ===2) {
        newInput(position[0], position[1], position[2], position[3])
        return
    }
    document.onkeypress = function (event) {
        if (!event.shiftKey&&event.keyCode === window.nextWordKeyCode) {
            left.removeClass(map[index - 1], "review_word")
            tempIndex2 = index
            // console.log(22222,tempIndex2)
            window["hasOnKey" + tempIndex2] = true

            map[index]&&left.playAudio(map[index].innerText)
            // console.log(111,window["hasOnKey" + tempIndex2],"hasOnKey" + tempIndex2)

            left.addClass(map[index++], "review_word")

            if (index < map.length) {
                review(index, index, position);
            } else {
                let tempIndex3
                document.onkeypress = function (event) {
                    if (!event.shiftKey&&event.keyCode === window.nextWordKeyCode) {
                        left.removeClass(map[index - 1], "review_word");

                        tempIndex3 = index
                        map[index]&&left.playAudio(map[index].innerText)
                        left.addClass(map[index], "review_word");
                        window["hasOnKey" + tempIndex3] = true

                        newInput(position[0], position[1], position[2], position[3])
                        return false;
                    }
                };

                setTimeout(function () {
                    if (!window["hasOnKey" + tempIndex3]) {
                        window["hasOnKey" + tempIndex3]=null
                        left.removeClass(map[index - 1], "review_word");

                        map[index]&&left.playAudio(map[index].innerText)

                        left.addClass(map[index], "review_word");

                        newInput(position[0], position[1], position[2], position[3])
                    }
                    window["hasOnKey" + tempIndex3]=null
                },window.TIME);

            }
        }
    };

    setTimeout(function () {
        // console.log(222,window["hasOnKey" + tempIndex2],"hasOnKey" + tempIndex2)
        if (!window["hasOnKey" + tempIndex2]) {

            left.removeClass(map[index - 1], "review_word");

            map[index]&&left.playAudio(map[index].innerText)

            left.addClass(map[index++], "review_word")

            if (index < map.length) {
                review(index, index, position);
            } else {

                let tempIndex3
                document.onkeypress = function (event) {
                    if (!event.shiftKey&&event.keyCode === window.nextWordKeyCode) {
                        left.removeClass(map[index - 1], "review_word");

                        tempIndex3 = index

                        left.playAudio(map[index].innerText)

                        left.addClass(map[index], "review_word");
                        // console.log(3333,tempIndex3)
                        window["hasOnKey" + tempIndex3] = true

                        newInput(position[0], position[1], position[2], position[3])
                        return false;
                    }
                };

                setTimeout(function () {

                    // console.log(!window["hasOnKey" + tempIndex3])
                    if (!window["hasOnKey" + tempIndex3]) {

                        left.removeClass(map[index - 1], "review_word");

                        map[index]&&left.playAudio(map[index].innerText)
                        left.addClass(map[index], "review_word");

                        newInput(position[0], position[1], position[2], position[3])


                    }
                    window["hasOnKey" + tempIndex3]=null
                }, window.TIME);

            }
        }
        window["hasOnKey" + tempIndex2] = null;
    }, window.TIME);

}

/**
 * 根据偏移量创建新的input
 * !!!请确保parentNode开启了定位
 * @param left 鼠标相对于最近开启定位的祖元素的左边偏移量,
 * @param top  鼠标相对于最近开启定位的祖元素的右边偏移量
 * @param parentNode 那个祖元素元素
 * @param isFirstWord 是否是输入的第一个单词
 */

function newInput(left, top, parentNode, isFirstWord) {
    // 到最后一个不在创建新的输入框
    if (window.left.word_list.current_word_index === window.left.word_list.children.length - 1) {
        if (!window.isLastNewinput) {
            window.isLastNewinput = 1;
        } else {
            window.isLastNewinput = 0;
            return;
        }
    }
    // console.log(left,top)
    let isHasInput = document.getElementsByTagName("input");
    //如果没有input。。。执行
    if (!isHasInput.length) {


        let newInput = document.createElement("input");

        // let offsetLeft;
        // let offsetTop =offsetLeft= Math.random();
        // let offsetTop = offsetLeft = 40;
        newInput.type = "text";
        newInput.style.position = "absolute";

        //如果不是第一个单词
        if (!isFirstWord) {
            //获取下一个位置，在空位满足的情况下不与其他的重合
            let offset = getRandomNum();
            newInput.style.left = (offset.randomW) + "px";
            newInput.style.top = (offset.randomH) + "px";

        } else {

            newInput.style.left = (left) + "px";
            newInput.style.top = (top) + "px";
        }

        //绑定失去焦点事件
        onBlurInput(newInput);

        //绑定键盘按键事件
        onKeyDownInput(newInput);

        parentNode.appendChild(newInput);

        newInput.focus();

        //创建输入框马上播放音频
        // console.log(document.querySelector(".recite>.word"))
        window.left.playAudio(document.querySelector(".recite>.word").innerText)
    }else {
        alert("请将当前输入错误，请清空输入框后再取消")
    }




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

/**
 * 在dom元素上方或下方显示文字，创建的div是挂载在dom的父元素的
 * @param msg 显示的文字
 * @param dom  那个dom元素
 * @param isUpward 是否在上方
 */
function alert_msg(msg,dom,isUpward){

    let warnDiv = document.createElement("div");

    warnDiv.innerText = msg

    // console.log(this.offsetTop,this.offsetLeft,this)
    warnDiv.style.left = dom.offsetLeft + "px"
    if (isUpward) {
        //!todo待完善，数字26
        warnDiv.style.top = dom.offsetTop - 26 + "px";
        left.addClass(warnDiv, "warn_input");
    } else {
        //!todo待完善，数字38
        warnDiv.style.top = dom.offsetTop + 40 + "px";
        left.addClass(warnDiv, "warn_input");
    }


    dom.parentNode.appendChild(warnDiv)

    setTimeout(() => {
        dom.parentNode.removeChild(warnDiv)
    }, 400)
}