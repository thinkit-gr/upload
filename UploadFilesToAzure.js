$(function () {
    $(".progress").hide();
    $(".alert.alert-danger").hide();
    $("body").removeClass("waitForIt");


    var sasKey = $("meta[name='sas']").attr("content");
    var uploadPrefix = $("meta[name='containerUrl']").attr("content");

    function upload(file, url) {
        $("#btnUpload").hide();
        $("#alert").hide();
        $(".progress").show();
        setPercent(0);
        try{
          var up = new Uploader();
          up.upload(file, url, setPercent, successCb, errorCb);
        }catch(ex){
          errorCb("Your browser doesn't support file upload", ex);
        }


        //var xhr = new XMLHttpRequest();
        //xhr.timeout = timeout * 1000;
        //// Hookup progress
        //xhr.upload.onprogress = function (e) {
        //    var percentComplete = Math.round((e.loaded * 100) / e.total);
        //    setPercent(percentComplete);
        //};
        //xhr.upload.onload = function () {
        //    $(".progress").hide();
        //    $("#fileControl").val(null)
        //    // Wait for service to update
        //    $("#fileList").html('<li class="list-group-item loading"></li>');
        //    setTimeout(updateUploadedFiles, 500);
        //}


        //xhr.onerror = function () {
        //    $(".alert.alert-danger").html("Error uploading via ajax. Press F12 and report the error you see in the console :)")
        //    $(".alert.alert-danger").show();
        //    $(".progress").hide();
        //}
        //xhr.open('PUT', url, true);
        //xhr.setRequestHeader('Content-Type', type);
        //xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        //xhr.send(file);
    }

    function successCb() {
        $("#btnUpload").show();
        $(".progress").hide();
        $("#fileControl").val(null)
        // Wait for service to update
        $("#fileList").html('<li class="list-group-item loading"></li>');
        setTimeout(updateUploadedFiles, 500);
    }

    function errorCb(desc, err) {
        $("#btnUpload").show();
        $(".alert.alert-danger").html("Error uploading files: " + desc + JSON.stringify(err));
        $(".alert.alert-danger").show();
    }

    function setPercent(value) {
        $(".progress .progress-bar").attr("aria-valuenow", value);
        $(".progress .progress-bar").width(value + "%");
        $(".progress .progress-bar").html(value + "%");
    }

    $("#btnUpload").click(function (evt) {
        evt.preventDefault();
        var files = fileControl.files;

        for (var i = 0, file; file = files[i]; i++) {

            var urlToUpload = uploadPrefix + "/" + file.name + sasKey;
            upload(file, urlToUpload);
            //var reader = new FileReader();

            //reader.onloadend = (function (theFile) {
            //    return function (e) {
            //        // In mb
            //        var size = theFile.size/(1024*1024);
            //        // https://msdn.microsoft.com/en-us/library/azure/dd135726.aspx set timeout
            //        var timeout = Math.round(size * 10 * 60);
            //        if (timeout < 30) timeout = 30;
            //        var urlToUpload = uploadPrefix + "/" + theFile.name + sasKey + "&timeout=" + timeout ;

            //    };
            //})(file);

            //reader.readAsArrayBuffer(file);
        }

    });

    function listBlobs(xml) {
        $(xml).find('Blob').each(function () {
            var url = $(this).find('Url').text();
            var name = $(this).find('Name').text();
            $('#fileList').append('<li class="list-group-item"><a href="' + url + '" target="_blank">' + name + '</a></li>');
        });
    }

    function updateUploadedFiles() {

        $("#fileList").html('<li class="list-group-item loading"></li>');

        $.ajax({
            type: 'GET',
            dataType: 'xml',
            url: uploadPrefix + '?restype=container&comp=list',
            success: function (data) {
                $("#fileList").html("");
                listBlobs(data);
            },
            error: function (res, status, xhr) {
                $(".alert.alert-danger").html("Error retrieving files. Press F12 and report the error you see in the console :)")
                $(".alert.alert-danger").show();
                $("#fileList").hide();
            }
        });
    }

    setTimeout(updateUploadedFiles, 0);

    //<div class="alert alert-warning" role="alert">Nothing uploaded yet</div>
});

