/*
 * @(#)HqlComposor.java Created on 2012-8-25 下午5:15:58
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.ehr.util;

import java.util.List;
import java.util.Map;

import ctd.config.schema.Schema;
import ctd.config.schema.SchemaController;
import ctd.config.schema.SchemaItem;
import ctd.util.context.Context;
import ctd.util.exp.ExpException;
import ctd.util.exp.ExpRunner;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class HqlComposor {
	
	public static String conectWhere(String where1, String where2) {
		return "(" + where1 + ") and (" + where2 + ")";
	}

	public static String createWhereQueryByField(String queryField, String value) {
		return queryField + "='" + value + "'";
	}

	public static String exp2string(String exp) {
		try {
			return ExpRunner.toString(exp, new Context());
		} catch (ExpException e) {
			e.printStackTrace();
			return "";
		}
	}

	public static String makeQuery(String entryName, List<String> fields,
			String where) {
		StringBuilder sql = new StringBuilder("select ");
		StringBuilder fs = new StringBuilder();
		for (String field : fields) {
			fs.append(",").append(field).append(" as ")
					.append(field.toUpperCase());
		}
		sql.append(fs.substring(1)).append(" from ").append(entryName);
		if (where != null && where.length() > 0) {
			sql.append(" where ").append(where);
		}
		return sql.toString();
	}

	public static String makeQuery(String entryName, String field, String where) {
		StringBuilder sql = new StringBuilder("select ").append(field)
				.append(" as ").append(field.toUpperCase()).append(" from ")
				.append(entryName);
		if (where != null && where.length() > 0) {
			sql.append(" where ").append(where);
		}
		return sql.toString();
	}

	public static String addOrder(String oSql, String orderField, boolean isDesc) {
		//start: policy add//
		if(oSql==null){
			return null;
		}
		StringBuilder sql = new StringBuilder(oSql);
		if(orderField!=null){
			sql.append(" order by ").append(orderField);
			if (isDesc) {
				sql.append(" desc");
			}
		}
		//end: policy add//
		return sql.toString();
	}

	/**
	 * @param entryName
	 * @param hasDoc
	 * @param where
	 * @return
	 */
	public static String makeQuery(String entryName, boolean hasDoc,
			String where) {
		StringBuilder sql = new StringBuilder("select ");
		StringBuilder tables = new StringBuilder(entryName).append(" a");
		Schema sc = SchemaController.instance().getSchema(entryName);
		StringBuilder fields = new StringBuilder();
		for (SchemaItem si : sc.getAllItemsList()) {
			fields.append(",a.").append(si.getId()).append(" as ")
					.append(si.getId().toUpperCase());
		}
		StringBuilder where2 = new StringBuilder();
		if (where != null && where.length() > 0) {
			where2.append(where);
		}
		if (hasDoc) {
			tables.append(",").append(entryName).append("_Doc b ");
			fields.append(",b.DocContent as DOCCONTENT");
			if (where2.length() > 0) {
				where2.append(" and ");
			}				
			where2.append("a.DCID=b.DCID");
		}
		sql.append(fields.substring(1)).append(" from ").append(tables);
		if (where2.length() > 0) {
			sql.append(" where ");
			sql.append(where2);
		} 
		return sql.toString();
	}
	/**
	 * @param entryName
	 * @param hasDoc
	 * @param idName
	 * @return
	 */
	public static String makeQueryById(String entryName, boolean hasDoc,
			String idName) {
		StringBuilder sql = new StringBuilder("select ");
		StringBuilder tables = new StringBuilder(entryName).append(" a");
		StringBuilder fields = new StringBuilder();
		Schema sc = SchemaController.instance().getSchema(entryName);
		for (SchemaItem si : sc.getAllItemsList()) {
			fields.append(",a.").append(si.getId()).append(" as ")
					.append(si.getId().toUpperCase());
		}
		StringBuilder where = new StringBuilder(idName).append("=?");
		if (hasDoc) {
			tables.append(",").append(entryName).append("_Doc b ");
			fields.append(",b.DocContent as DOCCONTENT");
			where.append(" and a.DCID=b.DCID");
		}
		sql.append(fields.substring(1)).append(" from ").append(tables)
				.append(where);
		return sql.toString();
	}

	/**
	 * @param entryName
	 * @param where
	 * @param data
	 * @return
	 */
	public static String makeUpdate(String entryName, String where,
			Map<String, Object> data) {
		StringBuilder sb = new StringBuilder("update ").append(entryName)
				.append(" set ");
		for (String column : data.keySet()) {
			sb.append(column).append("=:").append(column).append(",");
		}
		sb.deleteCharAt(sb.length() - 1);
		if (where != null && where.length() > 0) {
			sb.append(" where ").append(where);
		}
		return sb.toString();
	}
}
