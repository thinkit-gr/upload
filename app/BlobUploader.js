var UpZure;
(function (UpZure) {
    var Blob;
    (function (Blob) {
        // An uploader client 
        // based on https://msdn.microsoft.com/en-us/library/azure/mt427365.aspx
        // Limitations taken from https://msdn.microsoft.com/en-us/library/azure/dd135726.aspx
        var BlobUploader = (function () {
            function BlobUploader(url, file) {
                var _this = this;
                this.url = url;
                this.file = file;
                this.MAX_BLOB_SIZE = 4 * 1024 * 1024; //Each file will be split in 4Mb (used to be 256 KB).
                this.BLOCK_NAME_PREFIX = "blk-";
                this.MAX_BLOCKS = 50000; //a maximum of 50,000 blocks
                // The size of the file to upload
                this.totalSize = 0;
                // The bytes left to upload
                this.remainingBytes = 0;
                // Current point in the file
                this.currentFilePointer = 0;
                // The ids of the uploaded blocks
                this.blockIds = [];
                // Flag to stop processing
                this.stopProcessing = false;
                // Check if all the File APIs are supported.
                if (!(File && FileReader && FileList && Blob)) {
                    throw new Error('The File APIs are not fully supported in this browser.');
                }
                this.totalSize = file.size;
                this.fileReader = new FileReader();
                this.fileReader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReaderReadyState.DONE) {
                        var uri = url + '&comp=block&blockid=' + _this.blockIds[_this.blockIds.length - 1];
                        var requestData = new Uint8Array(evt.target.result);
                        $.ajax({
                            url: uri,
                            type: "PUT",
                            data: requestData,
                            processData: false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                                xhr.setRequestHeader('Content-Length', '' + requestData.length);
                            },
                            success: function (data, status) {
                                // update current indexes
                                _this.currentFilePointer += requestData.length;
                                _this.remainingBytes -= requestData.length;
                                // Calculate percent 
                                var percentComplete = ((_this.currentFilePointer / _this.totalSize) * 100).toFixed(2);
                                _this.handlePercentCompleted(percentComplete);
                                // And move along
                                _this.processRemainingFile();
                            },
                            error: function (xhr, desc, err) {
                                _this.handleError(desc, err);
                            }
                        });
                    }
                };
            }
            BlobUploader.prototype.handleError = function (desc, err) {
                console.error(desc, err);
            };
            BlobUploader.prototype.handlePercentCompleted = function (value) {
                console.info("Completed " + value + "%");
            };
            BlobUploader.prototype.handleFinish = function () {
                console.info("Finished uploading");
            };
            BlobUploader.prototype.getNextBlockId = function () {
                // We need a string
                var currentId = this.blockIds.length + '';
                // We pad it with 0's (50k is the max number so)
                currentId = "00000".substring(currentId.length) + currentId;
                return this.BLOCK_NAME_PREFIX + currentId;
            };
            BlobUploader.prototype.processRemainingFile = function () {
                if (this.stopProcessing)
                    return;
                if (this.remainingBytes > 0) {
                    var bytesToRead = this.MAX_BLOB_SIZE;
                    // If close the end
                    if (this.remainingBytes < bytesToRead) {
                        bytesToRead = this.remainingBytes;
                    }
                    // Get a slice of the file
                    var fileContent = this.file.slice(this.currentFilePointer, this.currentFilePointer + bytesToRead);
                    var blockName = this.getNextBlockId();
                    this.blockIds.push(btoa(blockName));
                    // and read it
                    this.fileReader.readAsArrayBuffer(fileContent);
                }
                else {
                    this.commitBlockList();
                }
            };
            BlobUploader.prototype.commitBlockList = function () {
                var _this = this;
                var uri = this.url + '&comp=blocklist';
                var requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
                for (var i = 0; i < this.blockIds.length; i++) {
                    requestBody += '<Latest>' + this.blockIds[i] + '</Latest>';
                }
                requestBody += '</BlockList>';
                $.ajax({
                    url: uri,
                    type: "PUT",
                    data: requestBody,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('x-ms-blob-content-type', _this.file.type);
                        xhr.setRequestHeader('Content-Length', '' + requestBody.length);
                    },
                    success: function (data, status) {
                        _this.handleFinish();
                    },
                    error: function (xhr, desc, err) {
                        _this.handleError(desc, err);
                    }
                });
            };
            BlobUploader.prototype.Upload = function (finishCb, errorCb, notifyPercent) {
                if (finishCb === void 0) { finishCb = null; }
                if (errorCb === void 0) { errorCb = null; }
                if (notifyPercent === void 0) { notifyPercent = null; }
                if (finishCb != null) {
                    this.handleFinish = finishCb;
                }
                if (errorCb != null) {
                    this.handleError = errorCb;
                }
                if (notifyPercent != null) {
                    this.handlePercentCompleted = notifyPercent;
                }
                this.remainingBytes = this.totalSize;
                this.currentFilePointer = 0;
                this.blockIds = [];
                this.stopProcessing = false;
                this.processRemainingFile();
            };
            BlobUploader.prototype.CancelUpload = function () {
                this.stopProcessing = true;
            };
            return BlobUploader;
        })();
        Blob.BlobUploader = BlobUploader;
        var FileReaderReadyState;
        (function (FileReaderReadyState) {
            FileReaderReadyState[FileReaderReadyState["EMPTY"] = 0] = "EMPTY";
            FileReaderReadyState[FileReaderReadyState["LOADING"] = 1] = "LOADING";
            FileReaderReadyState[FileReaderReadyState["DONE"] = 2] = "DONE";
        })(FileReaderReadyState || (FileReaderReadyState = {}));
    })(Blob = UpZure.Blob || (UpZure.Blob = {}));
})(UpZure || (UpZure = {}));
