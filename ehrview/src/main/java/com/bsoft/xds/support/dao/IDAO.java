package com.bsoft.xds.support.dao;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;

public interface IDAO {

	/**
	 * 查询记录数。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public int queryForCount(String classifying, String where,
			Map<String, Object> params) throws DataAccessException;

	/**
	 * 查询记录数。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public int queryForCount(String classifying, String where, Object[] params)
			throws DataAccessException;

	/**
	 * 以Map返回查询结果，用于单个记录的查询。
	 *  
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public Map<String, Object> queryForMap(String classifying, String where,
			Map<String, Object> params) throws DataAccessException;

	/**
	 * 以Map返回查询结果，用于单个记录的查询。
	 *  
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public Map<String, Object> queryForMap(String classifying, String where,
			Object[] params) throws DataAccessException;

	/**
	 * 以Map返回查询结果，用于单个记录的查询。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param params 查询参数。
	 * @return
	 * @throws DataAccessException
	 */
	public Map<String, Object> queryForMap(final String hql,
			final Map<String, Object> params) throws DataAccessException;

	/**
	 * 以Map返回查询结果，用于单个记录的查询。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param params 查询参数。
	 * @return
	 * @throws DataAccessException
	 */
	public Map<String, Object> queryForMap(final String hql,
			final Object[] params) throws DataAccessException;

	/**
	 * 查询一系列记录，以List返回。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Map<String, Object> params)
			throws DataAccessException;

	/**
	 * 查询一系列记录，以List返回。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Object[] params) throws DataAccessException;

	/**
	 * 查询一系列记录，以List返回。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForList(final String hql,
			final Map<String, Object> params) throws DataAccessException;

	/**
	 * 查询一系列记录，以List返回。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForList(final String hql,
			final Object[] params) throws DataAccessException;

	/**
	 * 分页查询一系列记录。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param start 起始行
	 * @param limit 返回最大记录数
	 * @param params 查询条件
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, int start, int limit, Map<String, Object> params)
			throws DataAccessException;

	/**
	 * 分页查询一系列记录。
	 * 
	 * @param classifying 数据集
	 * @param where 查询条件
	 * @param start 起始行
	 * @param limit 返回最大记录数
	 * @param params 查询条件
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, int start, int limit, Object[] params)
			throws DataAccessException;

	/**
	 * 分页查询一系列记录。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param start 起始行
	 * @param limit 最大返回记录数
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForPage(String hql, int start,
			int limit, Map<String, Object> params) throws DataAccessException;

	/**
	 * 分页查询一系列记录。
	 * 
	 * @param hql 查询语句，必须是hql
	 * @param start 起始行
	 * @param limit 最大返回记录数
	 * @param params 查询参数
	 * @return
	 * @throws DataAccessException
	 */
	public List<Map<String, Object>> queryForPage(String hql, int start,
			int limit, Object[] params) throws DataAccessException;

	/**
	 * 更新记录
	 * 
	 * @param classifying 数据集
	 * @param record 记录
	 * @throws DataAccessException
	 */
	public void update(String classifying, Map<String, Object> record)
			throws DataAccessException;

	/**
	 * 更新记录
	 * 
	 * @param classifying 数据集
	 * @param clause 更新语句（et. set a=:a）
	 * @param where
	 * @param params
	 * @return
	 * @throws DataAccessException
	 */
	public int update(String classifying, String clause, String where,
			Object[] params) throws DataAccessException;

	/**
	 * 删除记录
	 * 
	 * @param classifying 数据集
	 * @param fieldName 字段名
	 * @param value 字段值
	 * @return
	 * @throws DataAccessException
	 */
	public int delete(String classifying, String fieldName, String value)
			throws DataAccessException;

	/**
	 * 删除记录
	 * 
	 * @param classifying 数据集
	 * @param where 删除条件
	 * @param params 参数
	 * @return
	 * @throws DataAccessException
	 */
	public int delete(String classifying, String where, Object[] params)
			throws DataAccessException;

	/**
	 * 保存记录
	 * 
	 * @param classifying 数据集
	 * @param data 待保存的数据
	 * @throws DataAccessException
	 */
	public void save(String classifying, Map<String, Object> data)
			throws DataAccessException;
}
