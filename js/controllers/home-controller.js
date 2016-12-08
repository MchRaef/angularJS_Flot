/**
 * Created by Raef M on 11/24/2016.
 */
(function () {
    angular.module('artworks')
        .controller('HomeController', function ($scope) {
            that = this;
            that.notCSV = false;
            that.flotGraph = false;
            that.noFile = false;
            that.csvSet = false;
            that.nothingHappened = false;
            that.gpsExist = false;
            that.isTime = false;
            that.showGraph = false;
            that.file = null;
            that.latKey = null;
            that.longKey = null;
            that.selectionFrom = null;
            that.selectionTo = null;
            that.selectionPolyline = null;
            that.selectionExist = false;
            that.map = null;
            that.columns = [];
            that.fileContent = null;
            that.fileContentToSave = null;
            that.xAxis = null;
            that.dateTimeFormat = "M/d/yyyy hh:mm:ss";
            that.d3DateTimeFormat = "";
            that.chart = "flot";
            that.class = "";
            that.classes = [];
            that.flotPlot = null;
            that.receiveFile = function () {
                d3.select('#canvas').html(null);
                d3.select('#map').html(null);
                d3.select("#myColorsLegend").html(null);
                var reset = {
                    width: 0,
                    height: 0
                }
                $('#canvas').css(reset);

                that.columns = [];
                that.showGraph = false;
                that.gpsExist = false;
                that.selectionExist = false;
                that.selectionFrom = null;
                that.selectionTo = null;
                var f = document.getElementById('file').files[0];
                if (f != null) {
                    that.noFile = false;
                    if (f.name.split(".").slice(-1)[0] == "csv") {
                        that.notCSV = false;
                        that.nothingHappened = true;
                        that.file = f;
                        Papa.parse(f, {
                            header: true,
                            dynamicTyping: true,
                            complete: function (results) {

                                for (var key in results.data[0]) {
                                    for (var i = 0; i < results.data.length; i++) {
                                        if (results.data[i][key] == "") {
                                            results.data[i][key] = 0;
                                        }
                                    }
                                }
                                $scope.$apply(function () {
                                    that.fileContent = results.data;
                                    that.nothingHappened = false;
                                    that.csvSet = true;
                                    var lat = false, long = false;
                                    for (var key in that.fileContent[0]) {
                                        if (key.toLowerCase().trim() == "lattitude") {
                                            that.latKey = key;
                                            lat = true;
                                        }
                                        if (key.toLowerCase().trim() == "longitude") {
                                            that.longKey = key;
                                            long = true;
                                        }
                                        that.columns.push({
                                            header: key,
                                            selected: false
                                        });
                                    }
                                    if (long && lat) {
                                        that.gpsExist = true;
                                        that.showMap();
                                    }
                                    that.createCopy();
                                });
                            }
                        });
                    } else {
                        that.csvSet = false;
                        that.notCSV = true;
                    }
                } else {
                    that.csvSet = false;
                    that.noFile = true;
                }
            };
            that.createCopy = function () {
                that.fileContentToSave = JSON.parse(JSON.stringify(that.fileContent));
                for (var i = 0; i < that.fileContentToSave.length; i++) {
                    that.fileContentToSave[i]["class"] = "unclassified";
                }
                that.classes = [];
                that.class = "";
            };
            that.prepareData = function () {
                if (!that.xAxis) return;
                that.selectionExist = false;
                that.selectionFrom = null;
                that.selectionTo = null;
                d3.select('#canvas').html(null);
                d3.select("#myColorsLegend").html(null);
                // Cleaning the field that was selected as the x axis
                // Specifically, trimming and replacing nulls with empty strings
                for (var i = 0; i < that.fileContent.length; i++) {
                    if (!that.fileContent[i][that.xAxis]) {
                        that.fileContent[i][that.xAxis] = "";
                    }
                    if (that.fileContent[i][that.xAxis]) {
                        that.fileContent[i][that.xAxis] = String(that.fileContent[i][that.xAxis]).trim();
                    }
                }
                if (that.chart == 'dimple') {
                    that.flotGraph = false;
                    var width = 1100,
                        height = 600;
                    var svg = d3.select("#canvas")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append('g')
                        .attr('class', 'chart');
                    that.drawDimple(that.fileContent, svg);
                    // if (!Date.parseExact(that.fileContent[0][that.xAxis].trim(), that.dateTimeFormat)) {
                    //     that.dateTimeFormat = null;
                    // }
                    // d3.csv(that.file.name, that.draw);
                } else if (that.chart == 'flot') {
                    that.flotGraph = true;
                    $("#canvas").width(1100);
                    $("#canvas").height(600);
                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    var data = [];
                    var xticks = [];
                    for (var i = 0; i < that.columns.length; i++) {
                        var aColumn = that.columns[i];
                        if (aColumn.selected) {
                            var innerData = [];
                            for (var j = 0; j < that.fileContent.length; j++) {
                                if (xticks.length != that.fileContent.length)
                                    xticks.push([j, that.fileContent[j][that.xAxis]]);
                                // innerData.push([that.fileContent[j][that.xAxis], that.fileContent[j][aColumn.header]]);
                                innerData.push([j, that.fileContent[j][aColumn.header]]);
                            }
                            data.push({
                                label: aColumn.header,
                                data: innerData,
                            });
                        }
                    }
                    that.drawFlot(data, xticks);
                }
                that.showGraph = true;
            };
            that.drawDimple = function (data, svg) {

                var colors = randomColor({count: that.columns.length})
                var myChart = new dimple.chart(svg, data);
                var x;
                if (that.isTime) {
                    if (that.d3DateTimeFormat.length > 0) {
                        x = myChart.addTimeAxis("x", that.xAxis, that.d3DateTimeFormat);
                    } else {
                        x = myChart.addTimeAxis("x", that.xAxis);
                    }
                } else {
                    x = myChart.addCategoryAxis("x", that.xAxis);
                }
                // if (that.dateTimeFormat) {
                //     x.dateParseFormat = that.d3DateTimeFormat;
                //     x.tickFormat = "%H:%M:%S";
                // }
                for (var i = 0; i < that.columns.length; i++) {
                    var aColumn = that.columns[i];
                    if (aColumn.selected) {
                        var y = myChart.addMeasureAxis("y", aColumn.header);
                        myChart.addSeries(aColumn.header + ".", dimple.plot.line, [x, y]);
                        myChart.addSeries(aColumn.header + ".", dimple.plot.scatter, [x, y]);
                        myChart.addColorAxis(aColumn.header + ".", colors[i])
                    }
                }
                myChart.addLegend(800, 40, 300, 300);
                myChart.draw();
            };
            that.drawFlot = function (data, xticks) {
                var options = {
                    series: {
                        lines: {
                            show: true
                        },
                        points: {
                            show: true
                        }
                    },
                    legend: {
                        noColumns: 2
                    }, grid: {
                        hoverable: true,
                        clickable: true
                    },
                    xaxis: {},
                    yaxis: {
                        min: 0
                    },
                    selection: {
                        mode: "x"
                    }
                };
                var placeholder = $("#canvas");
                placeholder.bind("plotselected", function (event, ranges) {

                    var zoom = $("#zoom").prop("checked");

                    if (zoom) {
                        $.each(that.flotPlot.getXAxes(), function (_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        that.flotPlot.setupGrid();
                        that.flotPlot.draw();
                        that.flotPlot.clearSelection();
                    } else {
                        that.selectionFrom = parseInt(ranges.xaxis.from.toFixed(1));
                        that.selectionTo = parseInt(ranges.xaxis.to.toFixed(1));
                        if (that.selectionPolyline)
                            that.selectionPolyline.setMap(null);
                        if (that.gpsExist)
                            that.drawSelectionOnMap();
                        $scope.$apply(function () {
                            that.selectionExist = true;
                        });
                    }
                });

                placeholder.bind("plothover", function (event, pos, item) {

                    if (item) {
                        var x = item.datapoint[0].toFixed(2),
                            y = item.datapoint[1].toFixed(2);
                        $("#tooltip").html(item.series.label + " = " + y + " at " + xticks[parseInt(x)][1])
                            .css({top: item.pageY + 5, left: item.pageX + 5})
                            .fadeIn(200);
                    } else {
                        $("#tooltip").hide();
                    }
                });

                placeholder.bind("plotunselected", function (event) {
                    $("#selection").text("");
                });

                that.flotPlot = $.plot(placeholder, data, options);

                $("#clearSelection").click(function () {
                    if (that.selectionPolyline) {
                        that.selectionPolyline.setMap(null);
                    }
                    that.selectionFrom = null;
                    that.selectionTo = null;
                    $scope.$apply(function () {
                        that.selectionExist = false;
                    });
                    that.flotPlot.clearSelection();
                });

                that.submitClass();
            };
            that.showMap = function () {
                that.map = null;
                var coords = [];
                for (var i = 0; i < that.fileContent.length; i++) {
                    if (that.fileContent[i][that.latKey] && that.fileContent[i][that.longKey]) {
                        coords.push(new google.maps.LatLng(parseFloat(that.fileContent[i][that.latKey])
                            , parseFloat(that.fileContent[i][that.longKey])));
                    }
                }
                var mapCanvas = document.getElementById("map");
                var mapOptions = {
                    center: coords[0],
                    zoom: 7
                }
                that.map = new google.maps.Map(mapCanvas, mapOptions);
                var path = new google.maps.Polyline({
                    path: coords,
                    strokeColor: "#0000FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                path.setMap(that.map);
                google.maps.event.trigger(that.map, 'resize');
            };
            that.drawSelectionOnMap = function () {
                var coords = [];
                for (var i = that.selectionFrom; i <= that.selectionTo; i++) {
                    if (that.fileContent[i][that.latKey] && that.fileContent[i][that.longKey]) {
                        coords.push(new google.maps.LatLng(parseFloat(that.fileContent[i][that.latKey])
                            , parseFloat(that.fileContent[i][that.longKey])));
                    }
                }
                that.selectionPolyline = new google.maps.Polyline({
                    path: coords,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                that.selectionPolyline.setMap(that.map);
            };
            that.submitClass = function () {
                if (that.selectionFrom != null && that.selectionTo != null) {
                    if (that.class.length > 0) {
                        if (that.classes.indexOf(that.class.toLowerCase()) == -1)
                            that.classes.push(that.class);
                        for (var i = that.selectionFrom; i <= that.selectionTo; i++) {
                            that.fileContentToSave[i]["class"] = that.class.toLowerCase();
                        }

                    }
                }
                that.selectionTo = null;
                that.selectionFrom = null;
                that.selectionExist = false;
                that.class = "";
                var l = that.classes.length;
                if (l > 0) {
                    var markings = []
                    var colors = randomColor({
                        count: l,
                        luminosity: 'light',
                        format: 'rgb'
                    });
                    for (var i = 0; i < that.fileContentToSave.length; i++) {
                        j = that.classes.indexOf(that.fileContentToSave[i]['class']);
                        if (j > -1) {
                            markings.push({
                                color: colors[j],
                                lineWidth: 1,
                                xaxis: {from: i, to: i}
                            });
                        }
                    }

                    var options = that.flotPlot.getOptions();
                    options.grid.markings = markings;
                    that.flotPlot.setupGrid();
                    that.flotPlot.draw();
                    that.flotPlot.clearSelection();
                    d3.select("#myColorsLegend").html(null);
                    for (var i = 0; i < l; i++) {
                        $('#myColorsLegend').append(" <span class='color-legend' style='background-color:"
                            + colors[i] + ";'></span>" + that.classes[i] + " ");
                    }
                }
            };
            that.clearClasses = function () {
                that.createCopy();
                var options = that.flotPlot.getOptions();
                options.grid.markings = null;
                that.flotPlot.setupGrid();
                that.flotPlot.draw();
                that.flotPlot.clearSelection();
                d3.select("#myColorsLegend").html(null);
            };
            that.saveCSV = function () {
                var fields = [];
                for (var i = 0; i < that.columns.length; i++) {
                    fields.push(that.columns[i].header);
                }
                fields.push("class");

                var objArray = that.fileContentToSave;
                var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                var str = '';

                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    for (var index in array[i]) {
                        if (line != '') line += ','

                        line += array[i][index];
                    }

                    str += line + '\r\n';
                }


                str = fields.join(',') + '\r\n' + str;


                var isIE = /*@cc_on!@*/false || !!document.documentMode;
                var isEdge = !isIE && !!window.StyleMedia;
                // var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                // var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) {
                //         return p.toString() === "[object SafariRemoteNotification]";
                //     })(!window['safari'] || safari.pushNotification);
                // var isFirefox = typeof InstallTrigger !== 'undefined';
                // var isChrome = !!window.chrome && !!window.chrome.webstore;

                var name = that.file.name.split(".")[0];
                if (!isIE && !isEdge) {
                    var file = new File([str], name + ".ann.csv", {type: "text/plain;charset=utf-8"});
                    saveAs(file);
                } else {
                    var textFileAsBlob = new Blob([str], {
                        type: 'text/plain'
                    });
                    window.navigator.msSaveBlob(textFileAsBlob, name + ".ann.csv");
                    var popup = window.open('', 'csv', '');
                    popup.document.body.innerHTML = '<pre>' + str + '</pre>';
                }


                // var a = document.createElement('a');
                // var blob = new Blob([str], {'type':'application\/octet-stream'});
                // a.href = window.URL.createObjectURL(blob);
                // a.download = 'export.csv';
                // a.click();

                // if (navigator.appName != 'Microsoft Internet Explorer' && navigator.appName != "Netscape") {
                //     var name = that.file.name.split(".")[0];
                //     var file = new File([str], name + ".ann.csv", {type: "text/plain;charset=utf-8"});
                //     saveAs(file);
                // } else {
                //     var popup = window.open('', 'csv', '');
                //     popup.document.body.innerHTML = '<pre>' + str + '</pre>';
                // }

                // if (navigator.appName != 'Microsoft Internet Explorer') {
                //     window.open('data:text/csv;charset=utf-8,' + escape(str));
                // }
                // else {
                //     var popup = window.open('', 'csv', '');
                //     popup.document.body.innerHTML = '<pre>' + str + '</pre>';
                // }
            };

        });
})();