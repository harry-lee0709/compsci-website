function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName == "courses") {
        getCourseData();
    }
    if (tabName == "people") {
        getStaffData();
    }
    if (tabName == "news") {
        getNewsData();
    }
    if (tabName == "notices") {
        getNoticesData();
    }
}
var nav = false;
window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 850px)").matches) {
        document.getElementById("navbar").style.display = "block";
        nav = true;
    } else {
        document.getElementById("navbar").style.display = "none";
        nav = false;
    }
});

function showNav(id) {
    const navbar = document.getElementById(id);
        if (nav == false) {
            navbar.style.display = "block";
            nav = true;
        } else {
            navbar.style.display = "none";
            nav = false;
        }
}

function getCourseData() {
    const xhr = new XMLHttpRequest();
    const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/courses";
    xhr.open("GET", uri, true);
    xhr.onload = function() {
        const courseObj = JSON.parse(xhr.responseText);
        courseToTable(courseObj);
    }
    xhr.send(null);
}

function courseToTable(courseObj) {
    const courseData = courseObj.data;
    let tableContent = "<tr><th>Course ID</th><th>Course title</th><th>Description</th><th>Prerequisite</th></tr>";
	let popupId = "myPopup";
	let index = 1;
    courseData
        .sort((obj1, obj2) => obj1.catalogNbr.substring(0, 3) - obj2.catalogNbr.substring(0, 3))
        .forEach(function(data) {
			var temp = popupId + index;
            tableContent += "<tr><td><a class=\"popup\" onclick = \"getTimetableData('" + data.catalogNbr + "', "+ "\'"+ temp+ "\'" +")\">" + data.subject + data.catalogNbr +"<span class=\"popuptext\" id=\"" + temp +"\"></span>" +"</a></td><td>" + data.titleLong + "</td><td>";
            if (data.description != null)
                tableContent += data.description + "<td>";
            else tableContent += "Course description unavailable</td><td>";
            if (data.rqrmntDescr != null)
                tableContent += data.rqrmntDescr;
            else tableContent += "Departmental approval required. Contact the Coordinator before enrolment.";
            tableContent += "</td></tr>";
			index = index + 1;
        })
    document.getElementById("courseTab").innerHTML = tableContent;
}

function getStaffData() {
    const xhr = new XMLHttpRequest();
    const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/people";
    xhr.open("GET", uri, true);
    xhr.onload = function () {
        const peopleObj = JSON.parse(xhr.responseText);
        staffToTable(peopleObj);
    }
    xhr.send(null);
}

function staffToTable(peopleObj) {
    const staffData = peopleObj.list;
    let tableContent = "<tr><th>Staff Name</th><th>Email</th><th>Phone</th><th>Download Vcard</th><th>Photo</th></tr>";
    staffData
        .forEach(function(data) {
            tableContent += "<tr><td>" + data.firstname + " " + data.lastname + "</td>";
            if (data.emailAddresses != null)
                tableContent += "<td><a href='mailto:" + data.emailAddresses + "'>" + data.emailAddresses + "</a></td>";
            if (data.extn != null)
                tableContent += "<td><a href='tel: +64 9 373 7999'>+64 9 373 7999</a> ext " + data.extn + "</td>";
            else tableContent += "<td></td>";
            tableContent += "<td><a href=https://unidirectory.auckland.ac.nz/people/vcard/" + data.profileUrl[1] + ">Download</a>";
            if (data.imageId != null)
                tableContent += "</td><td><img class=\"staffPhoto\" src = https://unidirectory.auckland.ac.nz/people/imageraw/" + data.profileUrl[1] + "/" + data.imageId + "/large\></td></tr>";
            else tableContent += "</td><td><img class=\"staffPhoto\" src = https://unidirectory.auckland.ac.nz/people/imageraw/invalid/10000/medium\></td></tr>";
        })
    document.getElementById("peopleTab").innerHTML = tableContent;
}

function getTimetableData(catalogNbr, id) {
    const xhr = new XMLHttpRequest();
    const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/course?c=" + catalogNbr;
    xhr.open("GET", uri, true);
    xhr.onload = function() {
        const timetableObj = JSON.parse(xhr.responseText);
        const timetableData = timetableObj.data;
        let popup = document.getElementById(id);
        let content = "";
        if (timetableObj.total != 0) {
            timetableData
                .forEach(function(data) {
                    if (data.meetingPatterns != null) {
                        for (let i = 0; data.meetingPatterns.length > i; i++)
                            content += "Type: " +
                                data.component +
                                " Start Date: " +
                                data.meetingPatterns[i].startDate +
                                " End Date: " +
                                data.meetingPatterns[i].endDate +
                                " Start Time: " +
                                data.meetingPatterns[i].startTime +
                                " End Time: " +
                                data.meetingPatterns[i].endTime +
                                " Location: " +
                                data.meetingPatterns[i].location +
                                " Days of Week: " +
                                data.meetingPatterns[i].daysOfWeek +
                                "<br>";
                    }
                }) 
        } else content += "The timetable information is unavailable.";
        popup.innerHTML = content;
		popup.classList.toggle("show");
    }
    xhr.send(null);
}

function getNewsData() {
    const xhr = new XMLHttpRequest();
    const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/news";
    xhr.open("GET", uri, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onload = function () {
        displayNews(JSON.parse(xhr.responseText));
    }
    xhr.send(null);
}

function displayNews(newsObj) {
    const newsData = newsObj;
    let newsContent = "<h2>Department of Computer Science</h2>";
    newsData
        .forEach(data => newsContent += "<a href = " + data.linkField + "><h4>" + data.titleField + "</h4></a><p>" + data.pubDateField + "<p\n/><p class=\"newsItem\">" + data.descriptionField) + "</p>";
    document.getElementById("news").innerHTML = newsContent;
}

function getNoticesData() {
    const xhr = new XMLHttpRequest();
    const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/notices";
    xhr.open("GET", uri, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onload = function () {
        displayNotices(JSON.parse(xhr.responseText));
    }
    xhr.send(null);
}

function displayNotices(noticeObj) {
    const noticeData = noticeObj;
    let noticeContent = "<h2>Department of Computer Science</h2>";
    noticeData
        .forEach(data => noticeContent += "<a href = " + data.linkField + "><h4>" + data.titleField + "</h4></a><p>" + data.pubDateField + "<p\n/><p class=\"noticeItem\">" + data.descriptionField) + "</p>";
    document.getElementById("notices").innerHTML = noticeContent;
}

function commentPost(name) {
    let resp2 = document.getElementById("name").value
    const xhr = new XMLHttpRequest();
    const uri = " http://redsox.uoa.auckland.ac.nz/BC/Open/Service.svc/comment?name=" + resp2;
    let comments = document.getElementById("words").value
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    let resp1 = JSON.stringify(comments)
    xhr.send(resp1);
    document.getElementById('commentList').src = document.getElementById('commentList').src;
}