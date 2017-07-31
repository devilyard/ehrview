/*
 * @(#)HQLAnalyzer.java Created on 2013年11月29日 上午9:39:44
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.dao;

import java.util.List;

import org.hibernate.hql.antlr.HqlTokenTypes;
import org.hibernate.hql.ast.HqlParser;
import org.hibernate.hql.ast.util.ASTUtil;

import antlr.NoViableAltException;
import antlr.RecognitionException;
import antlr.TokenStreamException;
import antlr.collections.AST;

/**
 * 支持简单查询hql语句分析及分解重组操作。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class QueryHQLAnalyzer {

	private AST ast;
	private String hql;

	private QueryHQLAnalyzer() {

	}

	/**
	 * @param hql
	 * @throws RecognitionException
	 * @throws TokenStreamException
	 */
	public static QueryHQLAnalyzer getInstance(String hql)
			throws InvalidHqlException {
		HqlParser parser = HqlParser.getInstance(hql);
		try {
			parser.statement();
		} catch (RecognitionException e) {
			throw new InvalidHqlException(e.getMessage(), e);
		} catch (TokenStreamException e) {
			throw new InvalidHqlException(e.getMessage(), e);
		}
		QueryHQLAnalyzer ha = new QueryHQLAnalyzer();
		ha.ast = parser.getAST();
		ha.hql = hql;
		return ha;
	}

	/**
	 * 获取单个表名，默认返回第一个。
	 * 
	 * @return
	 */
	public String getTableName() {
		return getTableNames()[0];
	}

	/**
	 * 获取所有表名。
	 * 
	 * @return
	 */
	public String[] getTableNames() {
		@SuppressWarnings("unchecked")
		List<AST> ranges = ASTUtil.collectChildren(ast,
				new ASTUtil.IncludePredicate() {
					@Override
					public boolean include(AST node) {
						return HqlTokenTypes.RANGE == node.getType();
					}
				});
		String[] tables = new String[ranges.size()];
		int i = 0;
		for (AST range : ranges) {
			tables[i++] = range.getFirstChild().getText();
		}
		return tables;
	}

	/**
	 * @return
	 * @throws NoViableAltException
	 */
	public String getWhereClause() {
		AST where = getWhere(ast);
		if (where == null) {
			return null;
		}
		try {
			return generateHQLString(where);
		} catch (NoViableAltException e) {
			throw new IllegalArgumentException("Unable to analyze hql: "
					+ this.hql, e);
		}
	}

	/**
	 * @param where
	 *            需要替换的查询条件，如果是null表示要清除原来的查询条件。
	 * @return
	 */
	public String replaceWhere(String where) {
		AST whereAST = getWhere(ast);
		AST selectAST = ast.getFirstChild();
		if (where == null) {
			if (whereAST == null) {
				return hql;
			}
			selectAST.setNextSibling(whereAST.getNextSibling());
			try {
				return generateHQLString(ast);
			} catch (NoViableAltException e) {
				throw new IllegalArgumentException(
						"Unable to replace where(null) for hql: " + where, e);
			}
		}
		String fakeHQL = null;
		if (where.toLowerCase().indexOf("where") >= 0) {
			fakeHQL = "from table " + where;
		} else {
			fakeHQL = "from table where " + where;
		}
		HqlParser parser = HqlParser.getInstance(fakeHQL);
		try {
			parser.statement();
		} catch (RecognitionException e) {
			throw new InvalidHqlException(e.getMessage(), e);
		} catch (TokenStreamException e) {
			throw new InvalidHqlException(e.getMessage(), e);
		}
		AST newAST = parser.getAST();
		AST newWhereAST = getWhere(newAST);
		if (whereAST != null) {
			newWhereAST.setNextSibling(whereAST.getNextSibling());
		} else {
			AST nextAST = selectAST.getNextSibling();
			newWhereAST.setNextSibling(nextAST);
		}
		selectAST.setNextSibling(newWhereAST);
		try {
			return generateHQLString(ast);
		} catch (NoViableAltException e) {
			throw new IllegalArgumentException("Unable to generate hql: "
					+ where, e);
		}
	}

	/**
	 * @param ast
	 * @return
	 */
	private static AST getWhere(AST ast) {
		@SuppressWarnings("unchecked")
		List<AST> wheres = ASTUtil.collectChildren(ast,
				new ASTUtil.IncludePredicate() {
					@Override
					public boolean include(AST node) {
						return HqlTokenTypes.WHERE == node.getType();
					}
				});
		if (wheres != null && !wheres.isEmpty()) {
			return wheres.get(0);
		}
		return null;
	}

	/**
	 * 根据语法树生成hql语句。
	 * 
	 * @param ast
	 * @return
	 * @throws NoViableAltException
	 */
	private String generateHQLString(AST ast) throws NoViableAltException {
		StringBuilder sb = new StringBuilder();
		switch (ast.getType()) {
		case HqlTokenTypes.QUERY:
			for (AST a = ast.getFirstChild(); a != null; a = a.getNextSibling()) {
				sb.append(generateHQLString(a)).append(" ");
			}
			break;
		case HqlTokenTypes.SELECT_FROM:
			AST fromAST = ast.getFirstChild();
			AST selectAST = fromAST.getNextSibling();
			if (selectAST != null) {
				sb.append(generateHQLString(selectAST)).append(" ");
			}
			sb.append(generateHQLString(fromAST));
			break;
		case HqlTokenTypes.SELECT:
			sb.append(ast.getText()).append(" ");
			StringBuilder select = new StringBuilder();
			for (AST fieldAST = ast.getFirstChild(); fieldAST != null; fieldAST = fieldAST
					.getNextSibling()) {
				select.append(",").append(generateHQLString(fieldAST));
			}
			if (select.length() > 0) {
				sb.append(select.substring(1));
			}
			break;
		case HqlTokenTypes.FROM:
			sb.append(ast.getText()).append(" ")
					.append(generateHQLString(ast.getFirstChild()));
			for (AST nextEntryAST = ast.getFirstChild().getNextSibling(); nextEntryAST != null; nextEntryAST = nextEntryAST
					.getNextSibling()) {
				sb.append(",").append(generateHQLString(nextEntryAST));
			}
			break;
		case HqlTokenTypes.RANGE:
			sb.append(ast.getFirstChild().getText());
			AST aliasAST = ast.getFirstChild().getNextSibling();
			if (aliasAST != null) {
				sb.append(" ").append(aliasAST.getText());
			}
			break;
		case HqlTokenTypes.AS:
			sb.append(generateHQLString(ast.getFirstChild()));
			sb.append(" ").append(ast.getText()).append(" ")
					.append(ast.getFirstChild().getNextSibling().getText());
			break;
		case HqlTokenTypes.WHERE:
			sb.append(ast.getText()).append(" ");
			sb.append(generateHQLString(ast.getFirstChild()));
			break;
		case HqlTokenTypes.EQ:
			AST param = ast.getFirstChild();
			sb.append(generateHQLString(param));
			AST variable = param.getNextSibling();
			sb.append(ast.getText());
			sb.append(generateHQLString(variable));
			break;
		case HqlTokenTypes.DOT:
			sb.append(ast.getFirstChild().getText()).append(ast.getText())
					.append(ast.getFirstChild().getNextSibling().getText());
			break;
		case HqlTokenTypes.AND:
		case HqlTokenTypes.OR:
			AST child = ast.getFirstChild();
			if ((child.getType() == HqlTokenTypes.OR || child.getType() == HqlTokenTypes.AND)
					&& (false == child.getText().equals(ast.getText()))) {
				sb.append("(").append(generateHQLString(child)).append(")");
			} else {
				sb.append(generateHQLString(child));
			}
			for (AST next = child.getNextSibling(); next != null; next = next
					.getNextSibling()) {
				sb.append(" ").append(ast.getText()).append(" ");
				if ((next.getType() == HqlTokenTypes.OR || next.getType() == HqlTokenTypes.AND)
						&& false == next.getText().equals(ast.getText())) {
					sb.append("(").append(generateHQLString(next)).append(")");
				} else {
					sb.append(generateHQLString(next));
				}
			}
			break;
		case HqlTokenTypes.ORDER:
			sb.append(ast.getText()).append(" by ")
					.append(generateHQLString(ast.getFirstChild()));
			for (AST next = ast.getFirstChild().getNextSibling(); next != null; next = next
					.getNextSibling()) {
				if (next.getType() == HqlTokenTypes.DESCENDING
						|| next.getType() == HqlTokenTypes.ASCENDING) {
					sb.append(" ");
				} else {
					sb.append(",");
				}
				sb.append(next.getText());
			}
			break;
		case HqlTokenTypes.PARAM:
		case HqlTokenTypes.QUOTED_STRING:
		case HqlTokenTypes.IDENT:
			sb.append(ast.getText());
			break;
		default:
			throw new NoViableAltException(ast);
		}
		return sb.toString();
	}
}
