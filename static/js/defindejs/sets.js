var menuIds = ['prizes', 'result', 'backUp', 'userlist'];
var funIds = ['addPrize', 'deletePrize', 'editPrize', 'deleteResult',
    'exportResult', , 'printResult', 'importUserInfo', 'clearUserInfo', 'onekeyBack', 'onekeyReview'];
var showFunIds = [];
var currentPrefix = "p_";
function toggleMenu(menuId, liId) {
    //功能按钮
    //奖项设置   添加  删除 编辑
    //用户信息  导入  清空
    //榜单 删除 导出
    //备份与恢复 备份  恢复
    var currentleftLi = $('#' + liId).parent();
    var length = menuIds.length;
    var i = 0;
    for (; i < length; ++i) {
        if (menuIds[i] != menuId) {
            $('#' + menuIds[i]).addClass('hidden');
        }
    }
    switch (liId) {
        //备份与恢复
        case 'backUpMenu':
            currentPrefix = "b_";
            showFunIds.splice(0, showFunIds.length);
            showFunIds.push('onekeyBack', 'onekeyReview');
            hideFunBtn(['addPrize', 'deletePrize', 'editPrize', 'deleteResult',
                'exportResult', 'printResult', 'importUserInfo', 'clearUserInfo']);
            showFunBtn(showFunIds);
            $('#keyword').css('margin-top', 6);
            $("#backup_table").bootstrapTable("load", getdateEmpty());
            break;
        //榜单
        case 'resultMenu':
            currentPrefix = "l_";
            showFunIds.splice(0, showFunIds.length);
            showFunIds.push('deleteResult', 'exportResult', 'printResult');
            hideFunBtn(['addPrize', 'deletePrize', 'editPrize', 'importUserInfo', 'clearUserInfo', 'onekeyBack', 'onekeyReview']);
            showFunBtn(showFunIds);
            $('#keyword').css('margin-top', 6);
            $("#result_table").bootstrapTable("load", getLuckyRecords());
            break;
        //用户信息
        case 'userlistMenu' :
            currentPrefix = "e_";
            showFunIds.splice(0, showFunIds.length);
            showFunIds.push('importUserInfo', 'clearUserInfo');
            hideFunBtn(['addPrize', 'deletePrize', 'editPrize', 'deleteResult', 'exportResult', 'printResult', 'onekeyBack', 'onekeyReview']);
            showFunBtn(showFunIds);
            $('#keyword').css('margin-top', 6);
            $("#user_table").bootstrapTable("load", getEmployeeTableData(false));
            break;
        //奖项列表
        case 'prizesMenu':
            currentPrefix = "p_";
            showFunIds.splice(0, showFunIds.length);
            showFunIds.push('addPrize', 'deletePrize', 'editPrize');
            hideFunBtn(['deleteResult', 'exportResult', 'printResult', 'importUserInfo', 'clearUserInfo', 'onekeyBack', 'onekeyReview']);
            showFunBtn(showFunIds);
            $('#keyword').css('margin-top', 0);
            $("#prizes_table").bootstrapTable("load", getAllPrize());
            break;
        default:
            showFunIds.splice(0, showFunIds.length);
            showFunIds.push('importUserInfo', 'clearUserInfo');
            hideFunBtn(['addPrize', 'deletePrize', 'editPrize', 'deleteResult',
                'exportResult', 'printResult', 'onekeyBack', 'onekeyReview']);
            showFunBtn(showFunIds);
            $('#keyword').css('margin-top', 6);
            break;

    }
    $('#' + menuId).removeClass('hidden');
    $('.left-menu-item').removeClass('open');
    currentleftLi.addClass('open');
    $(window).scrollTop(0);
    //每次切换菜单的时候  去拉取一次数据
    /*$("#user_table").bootstrapTable("load", getEmployeeTableData(false));
     $("#prizes_table").bootstrapTable("load", getAllPrize());
     $("#result_table").bootstrapTable("load", getLuckyRecords());
     $("#backup_table").bootstrapTable("load", getdateEmpty());*/

}

// 隐藏功能按钮
function hideFunBtn(btnIds) {
    var i = 0;
    var length = btnIds.length;
    for (; i < length; i++) {
        $('#' + btnIds[i]).addClass('hidden');
    }
}
// 显示功能按钮
function showFunBtn(btnIds) {
    var i = 0;
    var length = btnIds.length;
    for (; i < length; i++) {
        $('#' + btnIds[i]).removeClass('hidden');
    }
}

// 模态框打开
function modalshow(modalId) {
    if (modalId === 'editprizeModal') {
        var selectPrizes = $('#prizes_table').bootstrapTable('getSelections');
        if (selectPrizes.length > 1) {
            $.jGrowl('每次只能选择一条纪录');
            return;
        } else if (selectPrizes.length === 0) {
            $.jGrowl('请选择一条纪录');
            return;
        } else {
            $('#old_prizeName').val(selectPrizes[0].name);
            $('#old_total').val(selectPrizes[0].total);
            $('#old_size').val(selectPrizes[0].size);
            $('#old_remark').val(selectPrizes[0].onlyUnlucky);
        }
    } else if (modalId === 'deletePrizeRecodeModal') { //删除中奖纪录
        var selectPrizesRecord = $('#result_table').bootstrapTable('getSelections');
        if (selectPrizesRecord.length === 0) {
            $.jGrowl('请选择一条纪录');
            return;
        }
    } else if (modalId === 'deletePrizeModal') {
        var selectPrizes = $('#prizes_table').bootstrapTable('getSelections');
        if (selectPrizes.length === 0) {
            $.jGrowl('请选择一条要删除的纪录');
            $('#' + modalId).modal('hide');
            return;
        }
    }else if (modalId === 'addPrizeModal') {
        $('#prizeName').val("");
        $('#total').val('');
        $('#size').val('');
        $('#remark').val('0');
    }
    $('#' + modalId).modal('toggle');
}

// 模态框关闭
function submit(modalId) {
    if (modalId == "importUserInfoModal") {  //导入员工信息
        var file = $("#userInfoFile").prop("files")[0];
        readFile(file);
        $('#' + modalId).modal('hide');
        $("#user_table").bootstrapTable("load", getEmployeeTableData(false));

    } else if (modalId === 'clearUserModal') { //清空员工信息
        clearEmployeeData();
        $('#' + modalId).modal('hide');
        $("#user_table").bootstrapTable("load", getEmployeeTableData(false));

    } else if (modalId === 'reviewDataModal') {//恢复数据
        var file = $("#reviewDataFile").prop("files")[0];
        console.log(file);
        importAllInfo(file);

        $('#' + modalId).modal('hide');
        window.location.href = 'set.html';
    } else if (modalId === 'editprizeModal') {//编辑奖项
        var prizeName = $('#old_prizeName').val().trim();
        var p = getPrize(prizeName);
        var total = 1 * $('#old_total').val().trim();
        var size = $('#old_size').val() * 1;
        var remark = $('#old_remark').val().trim();
        // var prizes = new Prize(prizeName, size, total, remark);
        //剩余数量为 现在的总数-已经抽奖的数量  如果大于0  不变  小于0  则等于0
        var left = total - ( p.total - p.left);
        // 当修改的总数小于已经抽奖的数量的时候，总数应该直接设置为0
        if (total < ( p.total - p.left)) {
            total = p.total - p.left;
        }
        left = left > 0 ? left : 0;
        p.left = left;
        p.total = total;
        p.size = size;
        p.remark = remark;
        updatePrize(p);
        $('#' + modalId).modal('hide');
        $("#prizes_table").bootstrapTable("load", getAllPrize());

    } else if (modalId === 'deletePrizeModal') {//删除奖项
        var selectPrizes = $('#prizes_table').bootstrapTable('getSelections');
        //如果删除的奖项中还有中奖纪录的话  不允许删除
        var flag = isRecored(selectPrizes);
        if (flag) {
            $.jGrowl('该奖项还有中奖纪录！请先删除中奖纪录');
            $('#' + modalId).modal('hide');
            return;
        } else {
            deletePrizes(selectPrizes);
        }
        $('#' + modalId).modal('hide');
        $("#prizes_table").bootstrapTable("load", getAllPrize());

    } else if (modalId === 'addPrizeModal') { //新增奖项
        var prizeName = $('#prizeName').val().trim();//名称
        var size = $('#size').val().trim();//奖金
        var total = $('#total').val().trim();//名额
        var remark = $('#remark').val().trim();//规则
        var prizes = new Prize(prizeName, size, total, remark);
        addPrize(prizes);
        $("#prizes_table").bootstrapTable("load", getAllPrize());
        $('#' + modalId).modal('hide');

    } else if (modalId === 'deletePrizeRecodeModal') {//删除中奖纪录
        var selectPrizesRecord = $('#result_table').bootstrapTable('getSelections');
        var i = 0;
        var length = selectPrizesRecord.length;
        for (; i < length; i++) {
            deleteRecord(selectPrizesRecord[i].eCode, selectPrizesRecord[i].pName);
        }
        $("#result_table").bootstrapTable("load", getLuckyRecords());
        $('#' + modalId).modal('hide');
    }
}

// 导入员工信息  奖项信息  榜单信息 备份信息
$(function () {

    $(".table").on("post-body.bs.table", function (data) {
            setTimeout(function () {
            formatTableHeader();
        }, 100);
    });
    
    //$("#user_table").bootstrapTable("load", getEmployeeTableData(false));
    $("#prizes_table").bootstrapTable("load", getAllPrize());
    //$("#result_table").bootstrapTable("load", getLuckyRecords());
    //导出榜单信息
    $('#exportResult').click(function (event) {
        var keyword = $('#keyword').val();
        downloadLucky(keyword);
    });
    // 打印榜单信息
    $('#printResult').click(function (event) {
        $('#result_table').bootstrapTable('hideColumn', 'check');
        $('#result_table').bootstrapTable('showColumn', 'EsingName');
        $("#result_table").jqprint();
        $('#result_table').bootstrapTable('hideColumn', 'EsingName');
        $('#result_table').bootstrapTable('showColumn', 'check');

    });
    toggleMenu('prizes', 'prizesMenu');
});

// 抽奖规则
function remark(value) {
    if (value === '0') {
        return '全部员工参与';
    } else if (value === '1') {
        return '未中奖员工参与';
    } else {
        return '';
    }
}
// 签名规则
function singName() {
    return "";
}

//奖品显示函数
function prizes(value, row) {
    if (getPrize(row.pName) != null)
        return getPrize(row.pName).size;
    else
        return "-";
}

//菜单高亮显示当前的内容
$(function () {
    var url_str = window.location.href;
    if (url_str.indexOf("set.html") >= 0) {
        $('#setHtml').css('color', '#fff');
    } else if (url_str.indexOf("main.html") >= 0) {
        $('#mainHtml').css('color', '#fff');
    } else if (url_str.indexOf("index.html") >= 0) {
        $('#indexHtml').css('color', '#fff');
    }
});

// 备份列表中没有数据   生成17条空记录
function getdateEmpty() {
    var array = [];
    for (var i = 0; i < 17; i++) {
        var obj = new Object({
            backupContent: "",
            backupData: "",
            backupSatus: ""
        });
        array.push(obj);
    }
    return array;
}
// 键盘松开的时候触发搜索事件
$(function () {
    $("#keyword").bind("keyup", function () {
        console.log("keyup");
        var keyword = $("#keyword").val();
        searchTable(currentPrefix, keyword);
    });
});

// 表格内容搜索
function searchTable(prefix, keyword) {

    const ignoredKeys = {};
    ignoredKeys["p_"] = ["index", "onlyUnlucky"];
    ignoredKeys["e_"] = ["lucks"];
    ignoredKeys["l_"] = ["round"];
    ignoredKeys["b_"] = [];

    var $table;
    if (currentPrefix == "p_")
        $table = $("#prizes_table");
    if (currentPrefix == "e_")
        $table = $("#user_table");
    if (currentPrefix == "l_")
        $table = $("#result_table");
    if (currentPrefix == "b_")
        $table = $("#backup_table");


    if (keyword == null && ($table.bootstrapTable("getData") != null && $table.bootstrapTable("getData").length != 0))
        return false;
    var loadAll = keyword.length == 0 || keyword.trim().length == 0;
    keyword = keyword.trim();
    var data = [];
    for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        if (loadAll && key.indexOf(prefix) == 0) {
            data.push(JSON.parse(storage.getItem(key)));
        } else if (key.indexOf(prefix) == 0 && storage.getItem(key).indexOf(keyword) != -1) {
            if (isKeyIgnored(storage.getItem(key), keyword, ignoredKeys[currentPrefix]))
                continue;
            data.push(JSON.parse(storage.getItem(key)));
        }
    }
    $table.bootstrapTable("load", data);
}
/**
 * 是否是 不被检索的key
 * @param json
 * @param keyword
 * @param ignores
 * @return {boolean}
 */
function isKeyIgnored(json, keyword, ignores) {
    if (checkByCode(keyword))
        return false;
    var reg = new RegExp('"([a-zA-Z0-9]+)":"*[a-zA-Z0-9]*' + keyword + '[a-zA-Z0-9]*"*', "g");
    var rs;
    var ignore = true;
    while ((rs = reg.exec(json)) != null) {
        var i = rs[1];
        if (ignores.indexOf(i) != -1) {
            ignore = true;
        } else {
            ignore = false;
            break;
        }
    }
    return ignore;
}
/**
 * 是不是汉字
 * @param string
 * @return {boolean}
 */
function checkByCode(string) {
    return string.charCodeAt() > 255;
}


// 导航到不同的tab
$(function () {
    var menuName = window.location.href.split('=')[1];
    //榜单列表
    if (menuName === 'list') {
        toggleMenu('result', 'resultMenu');
    } else if (menuName === 'result') {
        //奖项列表
        toggleMenu('prizes', 'prizesMenu');
    }
});

//删除奖项的时候，判断该奖项是否还有中奖纪录  有侧返回true
function isRecored(data) {
    var i = 0;
    var length = data.length;
    for (; i < length; ++i) {
        if (getLuckyRecords(data[i].name).length > 0) {
            return true;
        }
    }
    return false;
}

function formatTableHeader() {
    var ids = ["prizes", "userlist", "result"];
    for (var i = 0; i < ids.length; i++) {
        var divId = ids[i];
        var $table = $("#" + divId + " table");
        if ($table.bootstrapTable("getData").length>0) {
        $.each($table.find("th"), function (index, obj) {
            var width = $table.find("td:eq(" + index + ")").css("width");
            var head = $table.find("th")[index];
            $("#" + divId + " .fixed-table-header").find("th:eq(" + index + ")").css("width", width);
        }); 
        }
    }
}
   
/*$('#prizes_table').on('pre-body.bs.table', function () {
       var $template = $('<div class="custom-checkbox"> <input type="checkbox" id="chk1" class="inbox-check"><label for="chk1"></label>');
       $('#prizes_tableThead thead tr th:eq(0) div:eq(0)').empty().append($template);
    }
);*/

