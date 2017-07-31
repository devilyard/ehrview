/**
 * @(#)DateUtils.java Created on Jan 13, 2010 3:32:12 PM
 * 
 * 版权：版权所有 Chinnsii 保留所有权力。
 */
package com.bsoft.ehr.util;

import java.util.Date;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.joda.time.Period;
import org.joda.time.PeriodType;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

/**
 * 时间操作的一些工具。
 * 
 * @author <a href="mailto:rishyonn@gmail.com">chinnsii</a>
 */
public class DateUtils {

	/**
	 * 比较两个日期的年月日，忽略时分秒。
	 * 
	 * @param d1
	 * @param d2
	 * @return 如果d1晚于d2返回大于零的值，如果d1等于d2返回0，否则返回一个负值。
	 */
	public static int compare(Date d1, Date d2) {
		return new LocalDate(d1.getTime())
				.compareTo(new LocalDate(d2.getTime()));
	}

	/**
	 * 将日期转换成Date对象，支持的格式为yyyyMMdd, yyyyMMddHHmmss或者yyyy-MM-dd, yyyy-MM-dd
	 * HH:mm:ss，日期分隔符为（-,/,\）中的任意一个， 时间分隔符为（:）。 如果传入的日期格式不正确将返回null。
	 * 
	 * @param date
	 * @return 如果传入的日期格式正确将返回一个Date对象，否则返回null。
	 */
	public static Date toDate(String str) {
		if (str == null
				|| (str.length() != 8 && str.length() != 14
						&& str.length() != 10 && str.length() != 19)) {
			return null;
		}
		String pattern = null;
		if (str.length() == 8) {
			pattern = "yyyyMMdd";
		} else if (str.length() == 14) {
			pattern = "yyyyMMddHHmmss";
		} else if (str.length() == 10 || str.length() == 19) {
			if (str.contains("-")) {
				pattern = "yyyy-MM-dd";
			} else if (str.contains("/")) {
				pattern = "yyyy/MM/dd";
			} else if (str.contains("\\")) {
				pattern = "yyyy\\MM\\dd";
			}
			if (str.length() == 19) {
				pattern += " HH:mm:ss";
			}
		}
		DateTimeFormatter dtf = DateTimeFormat.forPattern(pattern);
		return DateTime.parse(str, dtf).toDate();
	}

	/**
	 * 按如下格式：yyyy-MM-dd 返回日期。
	 * 
	 * @param date
	 * @return
	 */
	public static String toString(Date date) {
		if (date == null) {
			return null;
		}
		return new DateTime(date).toString("yyyy-MM-dd");
	}

	/**
	 * 按指定的格式返回日期。
	 * 
	 * @param date
	 * @param pattern
	 * @return
	 */
	public static String toString(Date date, String pattern) {
		if (date == null) {
			return null;
		}
		return new DateTime(date).toString(pattern);
	}

	/**
	 * 按如下格式：yyyy-MM-dd HH:mm:ss 返回日期。
	 * 
	 * @param date
	 * @return
	 */
	public static String toLongString(Date date) {
		if (date == null) {
			return null;
		}
		return new DateTime(date).toString("yyyy-MM-dd HH:mm:dd");
	}

	/**
	 * 按指定格式返回日期。
	 * 
	 * @param date
	 * @param pattern
	 * @return
	 */
	public static String toLongString(Date date, String pattern) {
		if (date == null) {
			return null;
		}
		return new DateTime(date).toString(pattern);
	}

	/**
	 * 获取年份。
	 * 
	 * @param date
	 * @return
	 */
	public static int getYear(Date date) {
		return new DateTime(date).getYear();
	}

	/**
	 * @param date
	 * @return 实际月份的字面值，比Calendar返回的值多1。
	 */
	public static int getMonth(Date date) {
		return new DateTime(date).getMonthOfYear();
	}

	/**
	 * @param date
	 * @return
	 */
	public static int getDayOfMonth(Date date) {
		return new DateTime(date).getDayOfMonth();
	}

	/**
	 * @param date
	 * @return
	 */
	public static int getHour(Date date) {
		return new DateTime(date).getHourOfDay();
	}

	/**
	 * @param date
	 * @return
	 */
	public static int getMunite(Date date) {
		return new DateTime(date).getMinuteOfHour();
	}

	/**
	 * @param date
	 * @return
	 */
	public static int getSecond(Date date) {
		return new DateTime(date).getSecondOfMinute();
	}

	/**
	 * 获取基准日期是开始日期后的第几周，0到7天为第一周，8到14到第二周，依此类推。
	 * 
	 * @param begin
	 *            起始日期。
	 * @param datum
	 *            基准日期。
	 * @return 基准日期是开始日期后的第几周。
	 */
	public static int getWeeks(Date begin, Date datum) {
		if (compare(begin, datum) > 0) {
			return -1;
		}
		int days = getPeriod(begin, datum);
		return days % 7 > 0 ? days / 7 + 1 : days / 7;
	}

	/**
	 * 计算周年。
	 * 
	 * @param beginDate
	 *            起始日期。
	 * @param calculateDate
	 *            计算日。
	 * @return
	 */
	public static int getAnniversary(Date beginDate, Date calculateDate) {
		DateTime start = new DateTime(beginDate);
		DateTime end = new DateTime();
		if (calculateDate != null) {
			end = new DateTime(calculateDate);
		}
		Period p = new Period(start, end, PeriodType.years());
		return p.getYears();
	}

	/**
	 * 计算两个日期之间的天数，参数null表示当前日期。如果date2为null，计算date1到当前时间的天数。
	 * 
	 * @param date1
	 * @param date2
	 * @return
	 */
	public static int getPeriod(Date date1, Date date2) {
		if (date1 == null && date2 == null) {
			return 0;
		}
		DateTime start = new DateTime(date1);
		DateTime end = new DateTime();
		if (date2 != null) {
			end = new DateTime(date2);
		}
		Period p = new Period(start, end, PeriodType.days());
		return p.getDays();
	}
}
