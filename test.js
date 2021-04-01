window.onload=function(){
    let rihgt=document.querySelector(".right");

    let input;

    rihgt.ondblclick=function(event){
        event=event||window.event;
        let x=event.offsetX
        let y=event.offsetY

        input=document.createElement("input");

        input.style.position="absolute";
        input.type="text";

        input.style.left=x+"px";
        input.style.top=y+"px";

        rihgt.appendChild(input);

        input.focus();

        input.onblur=function(){
            save(input)

        }

        input.onkeydown=function(event){

            if(event.keyCode==13){
                save(input)
            }




        }

    }


    function save(input){

        let span=document.createElement("span");

        if(!/^\s*$/.test(input.value) ){
            span.innerText=input.value
            span.style.position="absolute";

            span.style.left=input.style.left;
            span.style.top=input.style.top;
            span.style.backgroundColor="red";

            input.parentNode.replaceChild(span,input);


            span.ondblclick=function(event){
                event=event||window.event;
                let newInput=document.createElement("input")
                newInput.type="text";
                newInput.style.position="absolute";
                newInput.style.left=span.style.left;
                newInput.style.top=span.style.top;
                newInput.value=span.innerText;
                newInput.onblur=function(){save(newInput)}
                newInput.onkeydown=function(event){
                    if(event.keyCode==13){
                        save(newInput)
                    }
                }

                span.parentNode.replaceChild(newInput,span)


                newInput.focus()

                window.event? window.event.cancelBubble = true : e.stopPropagation();
            }


        }else{
            input.parentNode.removeChild(input);
        }
    }

}