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
	$.fn.wulauiTimepicker = function () {
		return $(this).each((i, e) => {
			const $this = $(e), inited = $this.data('TimepickerObj');
			if (!inited) {
				$this.data('TimepickerObj', 1);
				let target = $this.attr('for');
				if (target) {
					target    = $(target);
					let value = target.val(), values = value.split(':');
					if (values.length === 0) {
						values = ['00', '00'];
					} else if (values.length === 1) {
						values.push('00');
					}
					$this.find('.hour').on('change', function () {
						values[0] = $(this).val();
						target.val(values.join(':'));
					}).val(values[0]);
					$this.find('.minute').on('change', function () {
						values[1] = $(this).val();
						target.val(values.join(':'));
					}).val(values[1]);
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
		let tt = $(this).find('[data-timepicker]');
		if (tt.length > 0) {
			tt.wulauiTimepicker();
		}
	})
})($);