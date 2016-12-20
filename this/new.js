var storage = window.localStorage;

/************************ 中奖记录操作************************/

/**
 * 添加一条中奖纪录
 * 会更新员工数据 -> 中奖数目 +1
 * @param eCode 工号
 * @param prizeName 奖项名称
 */
function addLuckyRecord(eCode, prizeName) {
    var prize = getPrize(prizeName);
    var e = getEmployeeByCode(eCode);

    if (prize == null) {
        console.info("奖项不存在: " + prizeName);
        return false;
    }
    if (prize.left < 1) {
        console.info("奖项剩余数量为0: " + JSON.stringify(prize));
        return false;
    }
    if (e == null) {
        console.info("员工不存在: " + eCode);
        return false;
    }

    /*1、添加中奖纪录*/
    var record = new Record(generateNextRecordIndex(), prizeName, eCode);
    record.round = getCurrentRecordRound();
    var addSucceed = addRecord(record);
    if (!addSucceed)
        return false;

    // console.log(record);

    /*2、更新奖项信息*/
    prize.left--;
    updatePrize(prize);

    /*3、更新员工信息*/
    e.lucks++;
    updateEmployee(e);
    return true;
}
function addRecord(record) {
    var key = "l_" + record.eCode + "-" + record.pName;
    if (getRecord(record.eCode, record.pName) != null) {
        console.error("该员工已经中过这个奖了？: " + storage.getItem(key));
        return false;
    }
    if (isNaN(record.index)) {
        console.error("record 的 index 不能为空: " + JSON.stringify(record));
        return false;
    }
    storage.setItem(key, JSON.stringify(record));
    return true;
}
function generateNextRecordRound() {
    var key = "d_recordRound";
    var index = storage.getItem(key);

    if (index == null || isNaN(index)) {
        index = 1;
    } else
        index = parseInt(index);
    storage.setItem(key, index + 1);
    return index;
}

function getCurrentRecordRound() {
    var key = "d_recordRound";
    var index = storage.getItem(key);
    if (isNaN(index)) {
        console.error("getCurrentRecordRound: index isNaN");
        return false;
    }
    index = parseInt(index);
    return index;
}

function getRecord(eCode, pName) {
    return JSON.parse(storage.getItem("l_" + eCode + "-" + pName));
}

function getLuckyRecords(pName) {
    var records = [];
    for (var i = 0; i < storage.length; i++) {
        if (storage.key(i).indexOf("l_") == 0) {
            if (pName == null || (pName != null && storage.key(i).indexOf(pName) != -1))
                records.push(JSON.parse(storage.getItem(storage.key(i))));
        }
    }
    return records.sort(sort);
}
function sort(a, b) {
    return a.index > b.index ? -1 : 1;
}

function deleteRecord(eCode, pName) {
    var e = getEmployeeByCode(eCode);
    e.lucks--;
    if (e.lucks < 0)
        console.info("deleteRecord,e.lucks < 0: " + e);
    updateEmployee(e);

    var prize = getPrize(pName);
    prize.left++;
    updatePrize(prize);

    storage.removeItem("l_" + eCode + "-" + pName);
}

/************************ 员工操作 **********************/

/**
 * 打乱的员工序列
 * @param once true为不允许多次中奖
 */
function getRandomEmployeeArray(once) {
    var es = getAllEmployee(once);
    es.sort(randomSort);
    return es;
}

function updateEmployee(employee) {
    storage.setItem("e_" + employee.code, JSON.stringify(employee));
}
/**
 * 获取员工
 * @param once 为true只能中奖一次
 * @return {Array}
 */
function getAllEmployee(once) {
    if (typeof once != "boolean")
        return [];
    var employees = [];
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("e_") == 0) {
            var employee = JSON.parse(storage.getItem(key));
            //跳过已经中奖的
            if (once && employee.lucks > 0)
                continue;
            employees.push(employee);
        }
    }
    return employees;
}

function getEmployeeByCode(code) {
    return JSON.parse(storage.getItem("e_" + code));
}

function getEmployeeTableData() {
    return getAllEmployee(false);
}

/**
 * 获取中奖员工
 * @return {Array}
 */
function getLuckyEmployees() {

    var employees = [];
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("e_") == 0) {
            var employee = JSON.parse(storage.getItem(key));
            if (employee.lucks == 0)
                continue;
            employees.push(employee)
        }
    }
    return employees;
}

function sortEmployeeByCode(a, b) {
    return a.code > b.code ? 1 : -1;
}

function addEmployees(employees) {
    $.each(employees, function (index, employee) {
        storage.setItem("e_" + employee.code, JSON.stringify(employee));
    });
}

/************************** 奖项操作 ******************/

function generateNextPrizeIndex() {
    var key = "d_prizeIndex";
    var index = storage.getItem(key);

    if (index == null || isNaN(index)) {
        index = 0;
    } else
        index = parseInt(index);
    storage.setItem(key, index + 1);
    return index;
}

function addPrize(prize) {
    if (getPrize(prize.name) != null) {
        console.error("奖项已经存在: " + prize.name);
        return false;
    }
    prize.index = generateNextPrizeIndex();
    storage.setItem("p_" + prize.name, JSON.stringify(prize));
}

function updatePrize(prize) {
    storage.setItem("p_" + prize.name, JSON.stringify(prize));
}

function getAllPrize() {
    var ps = [];
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("p_") == 0) {
            ps.push(JSON.parse(storage.getItem(key)));
        }
    }
    ps.sort(function (a, b) {
        return a.index > b.index ? -1 : 1;
    });
    return ps;
}

function getPrize(name) {
    if (name == null)
        return null;
    for (var i = 0; i < storage.length; i++) {
        if (storage.key(i) == ("p_" + name)) {
            return JSON.parse(storage.getItem("p_" + name));
        }
    }
    return null;
}

function deletePrizes(prizes) {
    var count = 0;
    for (var i = 0; i < prizes.length; i++) {
        var prize = prizes[i];
        if (storage.getItem("p_" + prize.name) != null) {
            storage.removeItem("p_" + prize.name);
            count++;
        }
    }
    console.log("删除了 " + count + " 个奖项");
}

/*********************** 导入员工数据 ********************/

/**
 * 事件
 * @param file
 */
function readFile(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = loaded;
    console.log("文件名: " + file.name);
}
/**
 * 导入员工数据
 * @param event
 */
function loaded(event) {
    console.log("开始导入数据: " + new Date());
    var fileString = event.target.result;
    var lines = fileString.split("\r\n");
    var employees = [];
    $.each(lines, function (index, line) {
        if (index == 0 || line.length == 0)
            return true;
        var e = line.split("\t");
        if (e.length < 2 || e[0].length == 0 || e[2].length == 0)
            return true;

        var codeString = e[4].trim();
        while (codeString.length < 4) {
            codeString = "0" + codeString;
        }

        var employee = {
            code: codeString,
            name: e[2].trim(),
            department: e[1].trim(),
            gender: e[5].trim(),
            lucks: 0
        };
        employees.push(employee);
    });
    clearEmployeeData();
    addEmployees(employees);
    $("#user_table").bootstrapTable("load", getEmployeeTableData(false));
    console.log("导入数据完成: " + new Date());
}

/*********************** init***********************/

function initPrize() {
    clearPrizeData();
    var p1 = new Prize("一等奖", 5888, 1, "1");
    addPrize(p1);
    var p2 = new Prize("二等奖", 1888, 5, "1");
    addPrize(p2);
    var p3 = new Prize("三等奖", 888, 10, "1");
    addPrize(p3);
    var p4 = new Prize("幸运奖", 100, 200, "1");
    addPrize(p4);
    console.log("重置了所有奖项");
}

function initAll() {
    clearEmployeeData();
    clearRecords();
    clearDataMap();
    // initPrize();
}

function clearDataMap() {
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("d_") == 0) {
            storage.removeItem(key);
            i--;
        }
    }
    console.log("删除了所有额外字段");
}

function clearRecords() {
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("l_") == 0) {
            storage.removeItem(key);
            i--;
        }
    }
    console.log("删除了所有中奖信息");
}


function clearEmployeeData() {
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("e_") == 0) {
            storage.removeItem(key);
            i--;
        }
    }
    console.log("删除了所有员工数据");
}
function clearPrizeData() {
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (key.indexOf("p_") == 0) {
            storage.removeItem(key);
            i--;
        }
    }
}

/******************** 导出文件 ***************************/

function downloadFile(content, fileName) {
    var BOM = "\uFEFF";
    var link = document.createElement("a");
    link.id = "downloadLink";
    document.body.appendChild(link);
    console.log(content);
    content = encodeURI(content);
    content = BOM + content;
    //console.log(content);
    link.href = 'data:text/plain;charset=utf-8,' + content;
    link.target = '_blank';
    link.download = fileName;
    $("#downloadLink").hide();
    link.click();
    console.log(link.href);
}
function downloadLucky(pName) {
    // var luckys = getLuckyRecords(pName);
    var luckys = $('#result_table').bootstrapTable('getData', 'true');
    // luckys.sort(function (a, b) {
    //     if (getPrize(a.pName).size >= getPrize(b.pName).size)
    //         return -1;
    //     else
    //         return 1;
    // });
    var fileContent = "序号\t奖项\t工号\t姓名\t部门\r\n";
    var e;
    $.each(luckys, function (i, r) {
        e = getEmployeeByCode(r.eCode);
        fileContent += [r.index, r.pName, r.eCode, r.eName, r.eDept].join("\t") + "\r\n";
    });
    downloadFile(fileContent, "中奖名单.txt");
}

/** *********************实体******************************** */

Prize.prototype = {
    name: null,
    size: null,
    total: null,
    left: null,
    index: null,
    remark: null,
    onlyUnlucky: null
};

function Prize(name, size, total, only) {
    this.name = name;
    this.size = size;
    this.total = total;
    this.left = total;
    this.onlyUnlucky = only;
}

Employee.prototype = {
    name: null,
    code: null,
    department: null,
    lucks: null
};

function Employee(name, code, department) {
    this.name = name;
    this.code = code;
    this.department = department;
    this.lucks = 0;
}

Record.prototype = {
    index: null,
    pName: null,
    eCode: null,
    eName: null,
    //第几回合
    round: null
};
/**
 * 一条榜单记录
 * @param index 中奖的序号
 * @param pName 奖项名称
 * @param eCode 工号
 * @constructor
 */
function Record(index, pName, eCode) {
    this.index = index;
    this.pName = pName;
    this.eCode = eCode;
    this.eName = getEmployeeByCode(eCode).name;
    this.eDept = getEmployeeByCode(eCode).department;
}

/*************************** tools ******************************/

function getARandomECodeEmployeeByPrize(pName) {

    // console.log("sta:" + new Date().getTime());
    var l = storage.length;
    //是否只抽没有中奖的
    var onlyUnlucky = getPrize(pName).onlyUnlucky == "1";
    var recordMap = {};
    var array = [];
    for (var i = 0; i < l; i++) {
        var k = storage.key(i);
        //中奖信息
        if (k.indexOf("l_") == 0 && k.indexOf("-" + pName) > 0) {
            var luck = JSON.parse(storage.getItem(k));
            recordMap[luck.eCode] = luck.eCode;
        } else if (k.indexOf("e_") == 0) {
            var employee = getEmployeeByCode(k.replace("e_", ""));
            if (onlyUnlucky) {
                if (employee.lucks == 0)
                    array.push(employee.code);
            } else {
                array.push(employee.code);
            }
        }
    }
    // console.log("mid:"new Date().getTime());
    if (!onlyUnlucky) {
        for (var j = 0; j < array.length; j++) {
            var code = array[j];
            if (recordMap[code] != null) {
                array[j] = null;
            }
        }
    }

    var r;
    do
        r = array[getRandom(array.length)];
    while (r == null);

    // console.log("end:" + new Date().getTime() + " : " + r);
    return r + "";
}

function getShowLuckyRecords() {
    var content = "";
    var lr = getLuckyRecords().sort(function (a, b) {
        return a.index >= b.index ? 1 : -1;
    });
    //lr.sort(sortEmployeeByIndex);
    $.each(lr, function (index, e) {
        content = e.eCode + "&nbsp;&nbsp;" + e.eName + "&#9;&nbsp;" + e.pName + "<br/>" + content;
    });
    return "<pre>" + content + "</pre>";
}
/**
 * 获取一个随机的员工
 * @param once 是否只每个人只能中一次奖
 */
function getARandomEmployee(once) {
    var es = getAllEmployee(once);
    var r = getRandom(es.length);
    return es[r];
}
/**
 * 获取下一个中奖的序号用以记录顺序
 * @return {number}
 */
function generateNextRecordIndex() {
    var key = "d_recordIndex";
    var index = storage.getItem(key);

    if (index == null || isNaN(index)) {
        index = 0;
    } else
        index = parseInt(index);
    storage.setItem(key, index + 1);
    return index;
}

function randomSort(a, b) {
    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
    return Math.random() > 0.5 ? -1 : 1;
}

/**
 * 产生一个随机数 from 0 to total - 1
 * @param total
 */
function getRandom(total) {
    if (isNaN(total)) {
        console.error("getRandom(total): total isNaN");
        return -1;
    }
    return parseInt(Math.random() * total);
}

function test() {
    var r = [];
    var random;
    var times = 1e7;
    for (var j = 0; j < times; j++) {
        random = parseInt(Math.random() * 1600);
        if (r[random] == null)
            r[random] = 1;
        r[random]++;
    }

    var chance = [];
    for (var i = 0; i < 1600; i++) {
        chance[i] = r[i] / (times / 1600);
    }
    console.log(r);
    console.log(chance);
}
/**
 * 导出所有信息 (localstorage)
 */
function exportAllInfo() {
    var ls = [];
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        var isInfo = key.indexOf("p_") == 0 || key.indexOf("l_") == 0 || key.indexOf("e_") == 0
            || key.indexOf("d_") == 0;
        if (isInfo) {
            ls.push({"key": key, value: storage.getItem(key)});
        }
    }

    var infos = "";
    for (var j = 0; j < ls.length; j++) {
        infos += ls[j].key + "::" + ls[j].value + "\r\n";
    }
    downloadFile(infos, "data.txt");
    //record.push(new Object({backupContent:'全部数据','backupData':new Date().getTime(),backupSatus:'成功'}));
}


function importAllInfo(file) {
    //var file = $("#fileInputId").prop("files")[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = readInfoFile;
    console.log("文件名: " + file.name);
}

function readInfoFile() {
    console.log("开始导入全部数据");
    var fileString = event.target.result;
    var lines = fileString.split("\r\n");
    for (var i = 0; i < lines.length; i++) {
        var ls = lines[i].split("::");
        storage.setItem(ls[0], ls[1]);
    }
    console.log("导入全部数据完成");
}