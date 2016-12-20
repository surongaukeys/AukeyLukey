/**
 * 弹出显示结果
 * @param pName
 * @param eCode
 * @param autoHide 定时自动隐藏
 * @param showType none,batch
 */
function showResult(pName, eCode, autoHide, showType) {

    // console.log(pName);
    updateShow();
    setStartBtnState("start");
    startAction = true;

    var e = getEmployeeByCode(eCode);
    var prizeName = pName.length <= 3 ? pName.split("").join(" ") : pName;

    // 不同的显示方式
    if (showType == "none") {

    } else if (showType == "batch") {
        $("#modal_title")[0].innerText = "天上掉馅饼".split("").join(" ");
        $("#modal_eName")[0].innerText = prizeName;
        $(".modal_prize_name")[0].innerText = prizeName;
        $(".modal_prize_name")[1].innerText = prizeName;
        $("#modal_info")[0].innerText = batchCount + " 个人张嘴接住了";
        showResultModal();
        
    } else {
        $("#modal_title")[0].innerText = "恭喜您中奖".split("").join(" ");
        $("#modal_eName")[0].innerText = e.name;
        $(".modal_prize_name")[0].innerText = prizeName;
        $(".modal_prize_name")[1].innerText = prizeName;
        $("#modal_info")[0].innerText = e.department + " 『" + e.code + "』";
        showResultModal();
        if (autoHide == true) {
            setTimeout(function () {
                hideResultModal();
            }, startSpan - 400);
        }
    }

    refreshTables();
}
//开始中奖
function showResultModal() {
    $("#running")[0].pause();

    $("#bg_black").show();
    var op = 0;
    $("#modal")[0].style.opacity = 0;
    $("#modal")[0].style.display = "block";
    var timer = setInterval(function () {
        op += 0.1;
        $("#modal")[0].style.opacity = op;
        if ($("#modal")[0].style.opacity >= 1) {
            clearInterval(timer);
        }
    }, 40);
    //中奖结束后的音效
    $('#stop')[0].play();
}
// 停止中奖
function hideResultModal() {
    $("#bg_black").hide();
    var op = 0;
    $("#modal")[0].style.opacity = 1;
    var timer = setInterval(function () {
        op += 0.1;
        $("#modal")[0].style.opacity = op;
        if ($("#modal")[0].style.opacity >= 0) {
            $("#modal")[0].style.display = "none";
            clearInterval(timer);
        }
    }, 100);
    // 中奖结果隐藏的时候刷新times
    // 这里的逻辑是转动停止的时候 times-1，为 0 之后归 1
    if (timesInput.value == 0) {
        var left = getPrize(prizeNameSpan.innerText).left;
        timesInput.value = left >= 1 ? 1 : 0;
    }
    $('#stop')[0].pause();
}

$(function () {
    $("#modal").click(function () {
        hideResultModal();
    });
});