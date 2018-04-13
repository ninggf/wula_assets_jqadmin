(($) => {
	$.fn.wulauiDatepicker = function () {
		return $(this).each((i, e) => {
			const $this = $(e), inited = $this.data('DatepickerObj');
			if (!inited) {
				$this.data('DatepickerObj', true);
				let ops          = {
						format               : $this.data('format') || 'yyyy-mm-dd',
						clearBtn             : true,
						daysOfWeekHighlighted: "0,6",
						calendarWeeks        : true,
						autoclose            : true,
						todayHighlight       : true,
					}, from      = $this.data('start'),
					to           = $this.data('end'),
					startDay     = $this.data('startday'),
					endDay       = $this.data('endday'),
					dwd          = $this.data('dwd'),
					disabledDays = $this.data('disabled');
				if (startDay) {
					ops.startDate = startDay;
				}
				if (endDay) {
					ops.endDate = endDay;
				}
				if (disabledDays) {
					ops.datesDisabled = disabledDays;
				}
				if (dwd) {
					ops.daysOfWeekDisabled = dwd;
				}
				$this.datepicker(ops);
				if (from) {
					from = $(from);
					if (from.length) {
						from.change(function () {
							$this.datepicker('setStartDate', $(this).val());
						}).change();
					}
				} else if (to) {
					to = $(to);
					if (to.length) {
						to.change(function () {
							$this.datepicker('setEndDate', $(this).val());
						}).change();
					}
				}
			}
		});
	};
	$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
		e.stopPropagation();
		let that = $(this).find('[data-datepicker]');
		if (that.length > 0) {
			if ($.fn.datepicker) {
				that.wulauiDatepicker();
			} else {
				layui.use('datepicker', function () {
					that.wulauiDatepicker();
				})
			}
		}
	})
})($);