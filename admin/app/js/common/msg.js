
	var dialog = function() {
	}

	dialog.prototype = {
		createModal : function() {
			return $('<div class="modal fade"></div>')
		},
		createDialog : function() {
			return $('<div class="modal-dialog"></div>')
		},
		createContent : function() {
			return $('<div class="modal-content"></div>');
		},
		createHeader : function() {
			return $('<div class="modal-header"></div>');
		},
		createBody : function() {
			return $('<div class="modal-body"></div>');
		},
		createFooter : function() {
			return $('<div class="modal-footer"></div>');
		},
		id : null,
		init : function(title, msg, detail, callback) {
			var modal = this.createModal();
			this.id = '_dialog_' + +new Date;
			modal.attr('id', this.id);
			var dialog = this.createDialog();
			var content = this.createContent();
			var header = this.createHeader();
			var icon = $('<span aria-hidden="true">&times;</span>');
			var closeBtn = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>');
			closeBtn.append(icon);
			header.append(closeBtn);
			if (!title)
				title = '';
			if (!msg)
				msg = '';
			if (typeof detail == 'function') {
				callback = detail;
				detail = '';
			}
			header.append('<h4 class="modal-title">' + title + '</h4>');
			var body = this.createBody();
			body
					.append('<div class="msg_warning_body"><span class="msg_warning_icon"></span><div><div class="msg_warning_text">'
							+ msg
							+ '</div><div style="color:#777">'
							+ detail
							+ '</div></div></div>');
			var footer = this.createFooter();
			var okBtn = $('<button type="button" class="btn btn-primary">确定</button>');
			if (typeof callback == 'function') {
				okBtn.on('click', function() {
					modal.modal('hide');
					callback();
				});
			}
			var cancelBtn = $('<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>');
			footer.append(okBtn);
			footer.append(cancelBtn);
			content.append(header);
			content.append(body);
			content.append(footer);
			dialog.append(content);
			modal.append(dialog);
			return modal;
		},
		show : function(title, msg, detail, callback) {
			var modal = this.init(title, msg, detail, callback);
			$('body').append(modal);
			modal.on('hidden.bs.modal', this.closeModal);
			modal.modal();
		},
		closeModal : function() {
			if (this.id) {
				$('#' + this.id).remove();
			}
		}
	}

	function alertMsg(title, msg, detail, callback) {
		new dialog().show(title, msg, detail, callback);
	}

	function toast(msg, type) {
		var js_tips = $('#js_tips');
		if (js_tips.length < 1) {
			js_tips = '<div id="js_tips" class="page_tips success" style="display: none;"><div class="inner"></div></div>';
			$('body').append(js_tips);
		}
		$('#js_tips .inner').html(msg);
		type = type == -1 ? 'error' : 'success';
		$('#js_tips').attr('class', 'page_tips ' + type);
		$("#js_tips").fadeIn(300);
		setTimeout(function() {
			$("#js_tips").fadeOut(300);
		}, 3000);
	}

	function toastError(msg){
		toast(msg,-1);
	}


	//loading
	$.fn.spin = function(opts) {
		this.each(function() {
			var $this = $(this), data = $this.data();

			if (data.spinner) {
				data.spinner.stop();
				delete data.spinner;
			}
			if (opts !== false) {
				data.spinner = new Spinner($.extend({
					color : $this.css('color')
				}, opts)).spin(this);
			}
		});
		return this;
	};

