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
        var up = new UpZure.Blob.BlobUploader(url, file);
        up.Upload(successCb, errorCb, setPercent);
    }
    function successCb() {
        $("#btnUpload").show();
        $(".progress").hide();
        $("#fileControl").val(null);
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
                $(".alert.alert-danger").html("Error retrieving files. Press F12 and report the error you see in the console :)");
                $(".alert.alert-danger").show();
                $("#fileList").hide();
            }
        });
    }
    setTimeout(updateUploadedFiles, 0);
});
