/**
 * Created by missF on 2017/7/5.
 */

// 工具方法模块

// setCookie()
function setCookie(name, value){
    var d=new Date();  
    d.setTime(d.getTime()+999999999*1000); 
    document.cookie=encodeURIComponent(name)+'='+ encodeURIComponent(value) + ';expires='+d.toGMTString();//set cookie
}
// getCookie()
function getCookie () {
    var cookie = {};
    var all = document.cookie;
    if (all === '')
        return cookie;
    var list = all.split('; ');
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var p = item.indexOf('=');
        var name = item.substring(0, p);
        name = decodeURIComponent(name);
        var value = item.substring(p + 1);
        value = decodeURIComponent(value);
        cookie[name] = value;
    }
    return cookie;
}
// removeCookie()
function removeCookie (name,value) {
    document.cookie = name + '='
    + value +'; max-age=0';
}
//查询参数序列化
function serialize(options){
    if(!options){//如果没有查询参数
        return "";//返回空字符
    }else{//否则
        var pairs=[];//定义一个数组
        for(var name in options){//遍历对象属性
            if(!options.hasOwnProperty(name)) continue;//过滤掉继承的属性和方法
            if(typeof options[name]==="function") continue;//过滤掉方法
            var value=options[name].toString();//属性值转字符串
            name=encodeURIComponent(name);//URI编码
            value=encodeURIComponent(value);//URI编码
            pairs.push(name+"="+value);//属性名和属性值放入数组
        }
        return pairs.join("&");//返回字符串
    }    
}
// ajax get方法
function get (url, options, callback) {
    //创建Ajax对象
    if(XMLHttpRequest){
        var xhr=new XMLHttpRequest();
    }else{
        var xhr=new ActiveXObject("Microsoft.XMLHTTP");//兼容ie
    }
    xhr.onreadystatechange=function(){//注册事件 处理返回数据
        if(xhr.readyState==4){//若请求完毕
        	console.log(xhr.status);
            if(xhr.status>=200&&xhr.status<300||xhr.status==304){//若请求成功
                callback(xhr.responseText);//调用回调函数处理响应结果
            }else{//若请求失败
                alert('Requst was unsuccessful:'+xhr.status);//返回请求失败原因
            }
        }
    } 
    xhr.open("get",url+'?'+serialize(options),true);//开启一个异步请求
    xhr.send(null);//发送请求 
}
//获取非行间样式即计算后的样式
function getStyle(obj, name) {
    if (obj.currentStyle) {
        return obj.currentStyle[name]
    } else {
        return getComputedStyle(obj, false) [name];
    }
}
//功能实现模块

// 1.广告区
(function(){
// 获取元素
var adV=document.getElementById("adV"),
    close=document.getElementById("close");
//功能实现   
// 点击关闭广告
close.onclick=function (){
	adV.style.display="none";
}
//判断网页是否是第一次浏览，如果第一次则弹出广告，然后设置cookie值，否则把广告隐藏
if(document.cookie==""){
    setCookie("closeSuc","close");
}
else{
    adV.style.display='none';
}
})();

// 2.关注登录区
// 获取元素
var concernB=document.getElementById("concernB"),//关注按钮
    shade=document.getElementById("shade"),//遮罩
    logF=document.getElementById("logF"),//登录表单
    logC=document.getElementById("logC"),//登录框关闭按钮
    logB=document.getElementById("logB"),//登录按钮
    loginSuc=getCookie("loginSuc"),
    loginSucStart=document.cookie.indexOf("loginSuc="),
    followSuc=getCookie("followSuc"),
    followSucStart=document.cookie.indexOf("followSuc=");
//unfollow方法
function unfollow(){
    removeCookie("followSuc","follow");
    removeCookie("loginSuc","login");
    concernB.className="concern";
    concernB.innerHTML="<button class='concern' id='concernB' onclick='concern()'><b>+</b> 关注</button>";
} 
//点击关注按钮
function concern(){
	// 如果没有成功登录过
	if(loginSucStart===-1){
        shade.style.display="block";
	    logF.style.display="block";//弹出登录框
        document.documentElement.style.overflow = "hidden" ;
    }
}
//功能实现
(function(){
    //关注
    if(followSucStart!==-1||loginSucStart!==-1){
    	concernB.className="follow";
        concernB.innerHTML="√已关注<span>丨 </span><i onclick='unfollow()'>取消</i>";
    }
    concernB.addEventListener("click",concern,false); 
    //验证表单登录
    var check=function (){
        if(logF.userName.value!=="studyOnline"){
            alert("请输入固定用户帐号：'studyOnline'!");
            logF.userName.focus();
            return false;
        }
        else if(logF.password.value!=="study.163.com"){
            alert("请输入固定用户密码：'study.163.com'!");
            logF.password.focus();
            return false;
        }
        else{
            //调用ajax登录
        	get("http://study.163.com/webDev/login.htm",{userName:$.md5(logF.userName.value),password:$.md5(logF.password.value)}, 
        		function(data){
        		    if(data==1) {
        		        setCookie("loginSuc","login");//请求成功设置登录cookie
        		    }
                    //登录成功
        		    if(document.cookie.indexOf("loginSuc=")!==-1){
        		        get("http://study.163.com/webDev/attention.htm",null,
        		        	function(data2){
        		                if(data2==1){
        		                    setCookie("followSuc","follow");//请求成功设置关注成功的cookie
                                    console.log(followSucStart)
        		                    if(document.cookie.indexOf("followSuc=")!==-1){
        		                   	    shade.style.display="none";
                                        logF.style.display="none";
                                        document.documentElement.style.overflow = "auto" ;
        		                   	    concernB.removeEventListener("click",concern,false);//解绑关注点击事件 
                                        //关注登录成功后增加一个类名设置已关注样式 	
                                        concernB.className="follow";
                                        concernB.innerHTML="√已关注<span>丨 </span><i onclick='unfollow()'>取消</i>";
        		                    }
        		                }
                            }
                        );
                    }
        	    }
            );
            return false;
        }
    }
    logB.addEventListener("click",check,false); 
    //登录框关闭按钮
    logC.onclick=function close(){
       shade.style.display="none";
       logF.style.display="none";
       document.documentElement.style.overflow = "auto" ;
    }
})();

//3.轮播图
(function(){
    //获取元素
    var pic=document.getElementById("pic"),
        li=pic.getElementsByTagName("li"),//轮播图片集合
        i=0,
        zIndex=1;//轮播图的zindex
    function fadein (ele) {
        var stepLength = 1/100;
        //判断元素初始透明度是否为0 ，不为0则改为0
        if (parseFloat(getStyle(ele,"opacity"))!==0) {
            ele.style.opacity = 0;
        }
        var step=function() {
            if (parseFloat(getStyle(ele,"opacity"))+stepLength < 1) {
                ele.style.opacity = parseFloat(getStyle(ele,"opacity"))+stepLength;
            } else {
                ele.style.opacity = 1;
                clearInterval(setIntervalFadein);
            }
        }
        var setIntervalFadein = setInterval(step, 5);
    }
    var mouseoverHandler=function(event) {
    	clearInterval(setIntervalautoPlay);
    } 
    var mouseoutHandler=function(event) {
    	setIntervalautoPlay=setInterval(autoPlay,5000);
    } 	
    function autoPlay(){
    	li[i].style.zIndex=zIndex;
    	fadein(li[i]);//调用淡入方法
    	pic.addEventListener("mouseover",mouseoverHandler,false);//鼠标移动到图片上时停止滚动
        pic.addEventListener("mouseout",mouseoutHandler,false);  //鼠标移出图片时继续滚动
    	zIndex++;
    	i++;
    	if(i===3)i=0;//边界处理 
    }
    var setIntervalautoPlay=setInterval(autoPlay,5000);  	
})();  

//4.产品课程区
(function (){
    //获取元素
    var mnB=document.getElementById("mnB"),
        mnC1=document.getElementById("mnC1"),
        mnC2=document.getElementById("mnC2"),
        B=mnB.getElementsByTagName("button"),
        ul=document.getElementById("mnC"),//ul
        div=document.getElementById("mPage"),
        A=div.getElementsByTagName("a"),//a集合
        i=0,
        targ;
    //可修改参数
    var pageNo=1,
        psize=20,
        type=10;
    //callback方法
    var callback=function(data){
        data=JSON.parse(data);//json转js
        var list=data.list,
            pageNo=data.pagination.pageIndex,//当前页码
            totlePageCount=data.pagination.totlePageCount;//总页数
        newUl(list);//调用newUl方法创建课程数据ul
        newA(totlePageCount);//调用newA方法创建翻页组件
    }
    var newUl=function(list){
        for(var i=0;i<list.length;i++){
            //创建课程区
            // 创建节点
            var li=document.createElement("li"),//li
                img=document.createElement("img"),//img
                name=document.createElement("h4"),//课程名称
                provider=document.createElement("h5"),//机构发布者
                div=document.createElement("div"),//在学人数的div
                icon=document.createElement("i"),//图标
                learnerCount=document.createElement("span"),//在学人数
                price=document.createElement("p");//价格
            // 设置属性
            img.setAttribute("src",list[i].bigPhotoUrl);
            div.setAttribute("class","learnerCount")
            // 设置节点文本内容
            name.textContent=list[i].name;
            provider.textContent=list[i].provider;
            learnerCount.textContent=list[i].learnerCount;
            if(list[i].price==0){
                price.textContent="免费";
            }else{
                price.textContent="￥"+list[i].price;
            }
            // 插入节点
            ul.appendChild(li);
            li.appendChild(img);
            li.appendChild(name);
            li.appendChild(provider);
            li.appendChild(div);
            div.appendChild(icon);
            div.appendChild(learnerCount);
            li.appendChild(price);
        } 
    }
    var newA=function(totlePageCount){
        //创建分页组件
        for(var i=0;i<totlePageCount+2;i++){
            var a=document.createElement("a");
            a.setAttribute("herf","javascript:void(0)");
            a.textContent=i;
            div.appendChild(a);
            if(i==0){
                a.setAttribute("class","first");
                a.textContent="";
            }else if(i==totlePageCount+1){
                a.setAttribute("class","last");
                a.textContent="";
            }
            if(pageNo==a.textContent){
                a.setAttribute("class","z-crt");
            }
        }
    }
    get("http://study.163.com/webDev/couresByCategory.htm",{pageNo:pageNo,psize:psize,type:type},callback); //请求数据
    //点击选项卡设置相应选中样式，且弹出对应课程  
    function whichElement (e){ 
        if(!e) {var e=window.event;}
        if (e.target) {targ = e.target;}
        else if (e.srcElement) {targ = e.srcElement;}//兼容IE
        for(var i=0;i<B.length;i++){
            B[i].className="";//清空样式
            targ.className="z-crt";//设置目标样式
        }  
        ul.innerHTML="";//清空ul内容
        div.innerHTML="";//清空page
        if(targ===mnC2){ 
            type=20;
            pageNo=1;
        }else{
            type=10;
            pageNo=1;
        }
        console.log(targ,pageNo,type);
        get("http://study.163.com/webDev/couresByCategory.htm",{pageNo:pageNo,psize:psize,type:type},callback); //请求数据         
    }
    mnB.addEventListener("mousedown",whichElement,false);  
    function whichElement2 (e){ 
        if(!e) {var e=window.event;}
        if (e.target) {targ = e.target;}
        else if (e.srcElement) {targ = e.srcElement;}//兼容IE
        ul.innerHTML="";//清空ul内容
        div.innerHTML="";//清空page
        if(targ.textContent!==""){                  
            pageNo=targ.textContent; 
        }
        if(targ.className==="first"){
            if(pageNo>1) {
                pageNo=pageNo-1;
            }
        }else if(targ.className==="last"){
            if(pageNo<3)
            pageNo=Number(pageNo)+1;
        }
        get("http://study.163.com/webDev/couresByCategory.htm",{pageNo:pageNo,psize:psize,type:type},callback); //请求数据           
    }
    div.addEventListener("click",whichElement2,false);
})();
//5.视频播放区
(function(){
    var video=document.getElementById("video"),
        videoB=document.getElementById("videoB"),
        mVideo=document.getElementById("mVideo"),//视频弹窗模块
        videoC=document.getElementById("videoC")//关闭按钮
        shade=document.getElementById("shade");//遮罩
    var videoHandler=function(){
            document.documentElement.style.overflow="hidden";
            shade.style.display="block";
            mVideo.style.display="block";   
        }
    video.addEventListener("click",videoHandler,false);
    var videoCHandler=function(){
        document.documentElement.style.overflow="auto";
        shade.style.display="none";
        mVideo.style.display="none";
    }
    videoC.addEventListener("click",videoCHandler,false);
})();
//6.最热排行区
(function(){
    //获取元素
    var ul=document.getElementById("hot");//ul
    //callback方法
    var callback=function(data){
        data=JSON.parse(data);//json转js 
        newUl(data);
    }
    var newUl=function(data){
        for(var i=0;i<data.length;i++){
            // 创建节点
            var li=document.createElement("li"),//li
                img=document.createElement("img"),//img
                name=document.createElement("p"),//课程名称
                icon=document.createElement("i"),//图标
                learnerCount=document.createElement("span");//在学人数
            // 设置属性
            img.setAttribute("src",data[i].smallPhotoUrl);
            // 设置节点文本内容
            name.textContent=data[i].name;
            learnerCount.textContent=data[i].learnerCount;
            // 插入节点
            ul.appendChild(li);
            li.appendChild(img);
            li.appendChild(name);
            li.appendChild(icon);
            li.appendChild(learnerCount);
        }
        //默认显示前十门课程 
        (function(){
            var li=ul.getElementsByTagName("li");
            for(var i=0;i<li.length;i++){
                if(i>=10){
                    li[i].className="hide";
                }
            }
        })();
    };
    get("http://study.163.com/webDev/hotcouresByCategory.htm",null,callback);
})();