window.loadingLeft = function () {



    let left = document.querySelector(".left");
    let right = document.querySelector(".right")
    //根据视口设置left和right container的大小
    left.style.height=right.style.height=window.innerHeight+"px"


    //当浏览器改变时调整
    window.onresize = function () {
        left.style.height=right.style.height=window.innerHeight+"px"
    };

    let word_list = document.querySelector(".word_list");
    window.left = {last_word, next_word, addClass, word_list, toggleClass, removeClass, playAudio};
    //每一个向上或向下的操作都会背监控，初始从0开始
    word_list.current_word_index=0

    left.addEventListener("wheel", function (event) {

        if (event.deltaY < 0&& word_list.current_word_index>0) {
            //往上滚动
            last_word(word_list)

        } else if (event.deltaY >= 0&& word_list.current_word_index<word_list.children.length-1){
            //往下滚动
            next_word(word_list)
        }

        event.preventDefault();
    });

    //利用事件冒泡的机制,只绑定一个对象即可
    let wordList = document.querySelector(".word_list");
    wordList.onclick = function (event) {
        let wordDom=event.target
        if (hasClass(event.target, "word")) {
            playAudio(wordDom.innerText)
        }
    };
    // let words = document.querySelectorAll(".word");
    // for (let word of words) {
    //     word.onclick = function (event) {
    //         console.log(this.innerText)
    //             // playAudio(this.innerText)
    //     };
    // }

function playAudio(word_str){
    let audioWord = document.querySelector("#audioWord");
    let autio_url=`https://dict.youdao.com/dictvoice?audio=${word_str}&type=2`
    audioWord.setAttribute("src",autio_url)
    audioWord.load()
    audioWord.play()
}
    /**
     * 滑动到上一个单词
     * @param word_list 操作的对象，是整一个单词表
     *
     */
    function last_word(word_list){
        if (word_list.current_word_index >0) {
            //

            let recite_word = word_list.children[word_list.current_word_index--];
            removeClass(recite_word,'recite');
            // addClass(recite_word,'last_recite')


            //这里不能换成recite_word,current_word_index不是一个
            addClass(word_list.children[word_list.current_word_index],'recite')

            const OFFSET=recite_word.clientHeight+5
            word_list.style.top=word_list.offsetTop+OFFSET+"px";
        }

    }

    /**
     * 与last类似
     */
    function next_word(word_list){
        if (word_list.current_word_index < word_list.children.length) {

            let recite_word = word_list.children[word_list.current_word_index++];



            removeClass(recite_word,'recite');
            // console.log(word_list.current_word_index)
            //这里不能换成recite_word,current_word_index不是一个
            addClass(word_list.children[word_list.current_word_index],'recite')

            const OFFSET=recite_word.clientHeight+5
            word_list.style.top=word_list.offsetTop-OFFSET+"px"
        }


    }

};

//下列方法是自定义的、对dom中class属性增删改的
/**
 *
 * @param obj 操作的对象
 * @param cn 删除的类名
 */
function removeClass(obj,cn){
    if (obj&&hasClass(obj, cn)) {
        let regExp = new RegExp("\\s\\b"+cn+"\\b");

        obj.className=obj.className.replace(regExp,"")
    }

}

function addClass(obj, cn) {
    if (obj&&!hasClass(obj, cn)) {
        obj.className+=" "+cn;
    }
}

function hasClass(obj, cn) {
    let regExp1 = new RegExp("\\s\\b"+cn+"\\b");
    let regExp2=new RegExp("^"+cn+"$");
    return regExp1.test(obj.className)||regExp2.test(obj.className)
}

function toggleClass(obj,cn) {
    if (hasClass(obj, cn)) {
        removeClass(obj, cn);
    } else {
        addClass(obj,cn)
    }
}