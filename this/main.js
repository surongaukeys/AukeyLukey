var prizeSelectUl = document.getElementById("option_size_content");
var optionSizeBtn = document.getElementById("option_size_btn");
var prizeNameSpan = document.getElementById("prize_name_sp");
var prizeLeftSpan = document.getElementById("prize_left_span");
var timesInput = document.getElementById("times_input");
var codesDiv = document.getElementById("codes");
var startBtn = document.getElementById("btn_start");
var multiLucky = false;
var startAction = true;

var codeHeight = $(".code_bit")[0].clientHeight;
var stopTimer;
var startTimer;
var codeArray;
var batchCount = 1;

/*两次开始之间的间隔*/
const startSpan = 3000;
/*开始多久之后停止*/
const stopSpan = 2000;


$(function () {
    prizeSelectInit();
    timesSelectInit();
    codeShowInit();
    btnInit();
});

var index = 0;
var timeSpan = 20;
originTop = parseInt(codesDiv.style.top.replace("px", ""));
var scroll = {
    speed: 0,
    speedMax: 50,
    speedMin: 2,
    aDown: -0.5,
    aUp: 1,
    top: 0,
    index: 0,
    /**
     * 开始
     * @param accelerate 是否加速 批量不加速   单个加速
     */
    start: function (accelerate) {

        if (!accelerate) {
            setStartBtnState("disabled");
            startTimer = setInterval(function () {
                scroll.top = scrollUp(scroll.speedMax);
            }, timeSpan);
        } else {
            var a = this.aUp;
            codeArray = getRandomEmployeeArray(true);
            index = 0;
            startTimer = setInterval(function () {
                scroll.speed += a;
                scroll.speed = Math.round(scroll.speed * 100) / 100;
                if (scroll.speed >= scroll.speedMax) {
                    a = 0;
                }
                scroll.top = scrollUp(scroll.speed);
            }, timeSpan);
        }
    },
    stop: function (accelerate, autoHide, showType) {
        // 取到当前奖项名称 和 员工工号  调用显示结果函数showResult()
        if (!accelerate) {
            /*--> 抽奖结束*/
            var dis = scroll.top - originTop;
            scrollUp(dis);
            clearInterval(startTimer);
            postStop(accelerate, autoHide, showType);
        } else {
            var a = scroll.aDown;
            clearInterval(startTimer);
            stopTimer = setInterval(function () {
                scroll.speed += a;
                scroll.speed = Math.round(scroll.speed * 100) / 100;
                if (scroll.speed <= scroll.speedMin) {
                    a = 0;
                    var dis = Math.abs(scroll.top - originTop);
                    if (dis <= scroll.speedMin) {
                        /*--> 抽奖结束*/
                        clearInterval(stopTimer);
                        scrollUp(dis);
                        postStop(accelerate, autoHide, showType);
                    }
                }
                var data = getLuckyRecords().slice(0, 12);
                $("#result_table").bootstrapTable("load", data);
                scroll.top = scrollUp(scroll.speed);

            }, timeSpan);
        }
    }
};

/**
 * 抽奖停止之后执行
 * @param accelerate
 * @param autoHide
 * @param showType 显示类型
 */
function postStop(accelerate, autoHide, showType) {
    // 抽奖次数 -1
    timesInput.value -= 1;
    addLuckyRecord(getCurrentCode(), prizeNameSpan.innerText);
    if (timesInput.value == 0)
        autoHide = false;
    showResult(prizeNameSpan.innerText, getCurrentCode(), autoHide, showType);
}

function scrollUp(distance) {
    var top = parseFloat(codesDiv.style.top.replace("px", "")) - distance;
    if (top < -codeHeight) {
        var codeP = codesDiv.children[0];
        codesDiv.removeChild(codeP);
        codesDiv.appendChild(codeP);
        setCode(getARandomECodeEmployeeByPrize(getCurrentPrizeName()), 2);
        if (index == codeArray.length)
            index = 0;
        top += codeHeight;
    }
    codesDiv.style.top = top + "px";
    return top;
}

var batchStartTimer;
var batchStopTimer;

function prizeSelectInit() {
    $(prizeSelectUl).empty();
    var prizes = getAllPrize();
    if (prizes.length == 0) {
        // initPrize();
    }
    for (var i = 0; i < prizes.length; i++) {
        var prize = prizes[i];
        var li = document.createElement("li");
        li.innerText = prize.name;
        prizeSelectUl.appendChild(li);
    }
}

function timesSelectInit() {
    var $lis = $("#option_size_content>li");
    if ($lis.length == 0) {
        console.error("奖项数量为0,");
        return false;
    }
    setTimesSelect($lis[0].innerText);
    $lis.click(function () {
        setTimesSelect(this.innerText);
    });
    $(timesInput).keyup(function () {
        var prize = getPrize(getCurrentPrizeName());
        if (parseInt(timesInput.value) > parseInt(prize.left)) {
            timesInput.value = prize.left;
        }
    });
}

function setTimesSelect(pName) {
    prizeNameSpan.innerText = pName;
    var prize = getPrize(pName);
    timesInput.max = prize.left;
    timesInput.value = (prize.left == 0 ? 0 : 1);
    prizeLeftSpan.innerText = "剩余：" + prize.left + " / " + prize.total;
    multiLucky = !prize.onlyUnlucky;
}

function codeShowInit() {
    codeArray = getRandomEmployeeArray(true);
    if (codeArray.length > 3) {
        setCode(getARandomECodeEmployeeByPrize(getCurrentPrizeName()), 0);
        // setCode(getARandomECodeEmployeeByPrize(getCurrentPrizeName()), 1);
        setCode(getARandomECodeEmployeeByPrize(getCurrentPrizeName()), 2);
    } else
        console.error("员工数据为空");
}

function startBtnClick(e) {
    $('#begin')[0].play();
    if (getAllEmployee(true).length == 0)
        return false;

    var times = parseInt(timesInput.value);
    if (times <= 0 || getPrize(getCurrentPrizeName()).left < 1)
        return false;
    if (startAction) {
        $("#running")[0].play();
        generateNextRecordRound();
        batchCount = times;
        if (times > 1 && times <= 10) {
            // 批量抽奖
            setStartBtnState("disabled");
            // setInterval在第一次执行前也会等待
            // 以此来避免
            if (times < 1) {
                clearTimeout(batchStartTimer);
                return false;
            }
            times--;
            scroll.start(false);
            batchStopTimer = setTimeout(function () {
                scroll.stop(false, true);
                clearTimeout(batchStopTimer);
            }, stopSpan);

            if (batchStartTimer != null)
                clearInterval(batchStartTimer);
            batchStartTimer = setInterval(function () {
                if (times < 1) {
                    clearTimeout(batchStartTimer);
                    return false;
                }
                times--;
                scroll.start(false);
                batchStopTimer = setTimeout(function () {
                    scroll.stop(false, true);
                    clearTimeout(batchStopTimer);
                }, stopSpan);
            }, startSpan)
        } else if (times > 10) {
            /*批量抽奖，不弹*/
            setStartBtnState("disabled");

            if (times < 1) {
                clearTimeout(batchStartTimer);
                return false;
            }
            times--;
            scroll.start(false);
            batchStopTimer = setTimeout(function () {
                var showType = times == 0 ? "batch" : "none";
                scroll.stop(false, true, showType);
                clearTimeout(batchStopTimer);
            }, stopSpan / 3);

            if (batchStartTimer != null)
                clearInterval(batchStartTimer);
            batchStartTimer = setInterval(function () {
                if (times < 1) {
                    clearTimeout(batchStartTimer);
                    return false;
                }
                times--;
                scroll.start(false);
                batchStopTimer = setTimeout(function () {
                    var showType = times == 0 ? "batch" : "none";
                    scroll.stop(false, true, showType);
                    clearTimeout(batchStopTimer);
                }, stopSpan / 3);
            }, startSpan / 3)
        } else {
            setStartBtnState("pause");
            scroll.start(true);
        }
    } else {
        scroll.stop(true);
        setStartBtnState("disabled");
    }
    startAction = !startAction;
    e.stopPropagation();
}

function btnInit() {
}

function setCode(code, index) {
    var codeP = codesDiv.children[index];
    for (var i = 0; i < 4; i++) {
        codeP.children[i].innerText = code.split("")[i];
    }
}

function updateShow() {
    var prize = getPrize(getCurrentPrizeName());
    timesInput.max = prize.left;
    prizeLeftSpan.innerText = "剩余：" + prize.left + " / " + prize.total;
}

function getCurrentCode() {
    var codeP = codesDiv.children[1];
    var code = "";
    for (var i = 0; i < 4; i++) {
        code += codeP.children[i].innerText;
    }
    return code;
}

function getCurrentPrizeName() {
    return prizeNameSpan.innerText;
}
/**
 * 改变startBtn 的状态
 * @param state : "pause","start","disabled"
 */
function setStartBtnState(state) {
    $(startBtn).removeClass();
    $(startBtn).addClass("btn_" + state);
    if (state == "pause") {
        startBtn.disabled = false;
    } else if (state == "start") {
        startBtn.disabled = false;
    } else if (state == "disabled") {
        startBtn.disabled = true;
    }
}
/**
 * 改border
 */
function formatTable(pageSize) {
    var data = getLuckyRecords();
    var tables = $("#tables .table.tableStyle[id*=result_table]");

    /*抽奖round 分割*/
    for (var j = 0; j < data.length - 1; j++) {
        if (data[j].round != data[j + 1].round) {
            var $table = $(tables[parseInt(j / pageSize) + 1]);
            var trs = $table.find("tbody>tr");

            var tr = trs[j % pageSize];
            $(tr).addClass("recordBorder");
        }
    }
    /*背景榜单透明度渐变*/
    formatTablesOpacity(12);
    /*调整榜单的位置*/
}

function formatTablesOpacity(pageSize) {
    var tables = $(".table.tableStyle[id*=result_table]");
    var show = $("#tables")[0].style.display != "none";
    for (var c = 0; c < tables.length; c++) {
        var tableTrs = $(tables[c]).find("tbody>tr");
        for (var b = 0; b < tableTrs.length; b++) {
            var tableTr = $(tables[c]).find("tbody>tr")[b];
            if (!show) {
                $(tableTr).css("opacity", Math.pow(b / ((pageSize - 1) / 2) - 1, 2));
            }
            else {
                $(tableTr).css("opacity", 1);
            }
        }
    }
}

function toggleShowAll(event) {
    var text = $("#show_all")[0].innerText;
    console.log(text);
    text = text == "显示全部" ? "显示当前" : "显示全部";
    $("#show_all")[0].innerText = text;
    refreshTables(true);
    event.stopPropagation();
}