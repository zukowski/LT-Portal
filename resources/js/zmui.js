function ZMUI(){

var self = this;
this.restApi = {
    proxyUrl: 'http://zuke.sandbox.zmdev.net/proxy.php?',
    baseUrl: 'http://zuke.sandbox.zmdev.net:3000/',
    defaultFormat: 'json',
    methods: {
        getProjectList: 'projects'
    }
    
}
this.layout = {
    boxes: {
        mainWidth: 0,
        mainHeight: 0,
        totalFixedOuterWidth: 0,
        main: $("#main"),
        header: $("#header"),
        cols: []
    }
};

this.init = function() {
    this.initLayout();
}

this.initLayout = function() {
    this.calculateWidths();
    this.calculateHeights();
    this.bindResizeHandler();
    $(window).resize();
}

// Measures and sets the total outerWidth of fixed width columns
this.calculateWidths = function() {
    self.layout.boxes.mainWidth = self.layout.boxes.main.width();
    width = 0;
    self.layout.boxes.main.find('.col.fixed-width').each(function() {
        width += $(this).outerWidth(true);
    });
    self.layout.boxes.totalFixedOuterWidth = width;
}

// Measures and sets the total outerWidth of fixed width columns
this.calculateHeights = function() {
    self.layout.boxes.mainHeight = $(window).height() - self.layout.boxes.header.outerHeight() - 10;
}

// Resizes fluid-width divs on window resize
this.bindResizeHandler = function() {
    $(window).resize(function() {
        self.calculateHeights();
        self.calculateWidths();
        self.layout.boxes.main.find('.col.fluid-height .box').each(function() {
            $(this).height(
                self.layout.boxes.mainHeight
            );
        });
        self.layout.boxes.main.find('.box.fluid-width').each(function() {
            $(this).width(
                self.layout.boxes.mainWidth -
                self.layout.boxes.totalFixedOuterWidth -
                2
            );
        });
    });
}

this.getRestRequestUrl = function(method,format) {
    if(format === undefined) format = self.restApi.defaultFormat;
    url = self.restApi.baseUrl + method + "." + format;
    return url;
}

this.getTemplate = function(template,containerId,callback) {
    if(template.substr(0,1) == '/' ) template = template.substr(1);
    if(template == '') template = 'home';
    $.ajax({
        url: template + '.html',
        type: "GET",
        success: function(response) {
            $("#" + containerId).html(response);
            $("#tabs").tabs();
            $(window).resize();
            if(callback !== undefined) {
                callback.call();
            }
        }
    });
}

this.getProjectList = function() {
    //if(!self.projectListLoaded) {
        $.ajax({
            url: self.restApi.proxyUrl,
            type: "GET",
            data: {
                url: self.restApi.baseUrl,
                path: self.restApi.methods.getProjectList,
                format: self.restApi.defaultFormat
            },
            success: function(response){
                self.drawProjectList(JSON.parse(response));
                self.projectListLoaded = true;
            }
        });
    //}
}

this.drawProjectList = function(projects) {
    function resizeTable() {
        $("#project-list").height(
            $("#main-center").height() -
            $("#tab-menu").outerHeight() -
            $("#projects-header").outerHeight() -
            $("#project-list-header").outerHeight() -
            12);
    }
    //resizeTable();
    //$(window).resize(resizeTable);
    var class = 'even';
    /*
    var content = $("<div></div>");
    $.each(projects,function(index,data) {
        $('<div></div>')
            .css('width','100%')
            .addClass(class)
            .append('<div class="column" style="float:left;width:70%;">' + data.project.title + '</div>')
            .append('<div class="column" style="float:left;width:15%;">Video</div>')
            .append('<div style="float:left;width:15%;">' + data.project.duration + '</div>')
            .append('<div style="clear:both;"></div>')
            .appendTo(content)
            .hover(function() { $(this).addClass('hover'); }, function() { $(this).removeClass('hover'); });
        if(class == 'even') {
            class='odd';
        } else {
            class='even';
        }
    });
    $("#project-list *").replaceWith(content);
    */
    var table = $("<table cellpadding='4' cellspacing='0' width='100%' id='project-list-table'></table>");
    $("<thead><tr><th class='nopad'></th><th width='75%'>Title</th><th width='12%'>Type</th><th width='12%'>Status</th></tr></thead>").appendTo(table);
    var tbody = $("<tbody style='overflow:hidden;'></tbody>");
    $.each(projects,function(index,data) {
        var details = '';
        details =
            '<div class="project-details ui-widget ui-widget-content ui-corner-all ui-padding" style="display:none;">' +
                '<table>' +
                    '<tr>' +
                        '<td valign="top"><img src="' + data.project.screenshot_uri + '" width="100" /></td>' +
                        '<td valign="top">' +
                            '<p>' + data.project.description + '</p>' +
                            '<strong>dotSub:</strong> <a target="_blank" href="' + data.project.display_uri + '">' + data.project.display_uri + '</a>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
        var moreInfo =  $('<td valign="top" style="width:16px;"></td>');
        $('<div class="ui-icon ui-icon-circlesmall-plus" style="cursor:pointer;"></div>')
            .click(
                function() {
                    if($(this).parent().parent().find('.project-details').hasClass('project-details-open')) {
                        $('.project-details').each(function() {
                            if($(this).hasClass('project-details-open')) {
                                $(this).removeClass('project-details-open').slideUp();
                            }
                        });
                        $(this).parent().parent().find('.project-details').removeClass('project-details-open').slideUp();
                    } else {
                        $('.project-details').each(function() {
                            if($(this).hasClass('project-details-open')) {
                                $(this).removeClass('project-details-open').slideUp();
                            }
                        });
                        $(this).parent().parent().find('.project-details').addClass('project-details-open').slideDown();
                    }
                }
            )
            .appendTo(moreInfo);
        $('<tr></tr>')
            .css('width','100%')
            .addClass(class)
            .append(moreInfo)
            .append('<td valign="top">' + data.project.title + details + '</td>')
            .append('<td valign="top">Video</td>')
            .append('<td valign="top">' + data.project.transcription_status + '</td>')
            .hover(function() { $(this).addClass('hover'); }, function() { $(this).removeClass('hover'); })
            .appendTo(tbody);
        if(class == 'even') {
            class='odd';
        } else {
            class='even';
        }    
    });
    tbody.appendTo(table);
    $("<tfoot></tfoot>").appendTo(table);
    $("#project-list *").replaceWith(table);
    $('#project-list-table').dataTable({
    		"bPaginate": true,
    		"sPaginationType": "full_numbers",
    		"bJQueryUI": true,
    		"iDisplayLength": 15,
    		"bLengthChange": false,
    		"bFilter": true,
    		"bSort": true,
    		"bInfo": true,
    		"bAutoWidth": false,
    		"aoColumns": [
                { "bSortable": false },
                null,
                null,
                null
            ],
    		"aaSorting": [[1,'asc']]
    });

}

}