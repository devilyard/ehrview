/*
 * @(#)MPIProxyInitializer.java Created on 2014年1月13日 下午2:37:57
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.util;

import org.springframework.beans.factory.annotation.Autowired;

import com.bsoft.mpi.server.rpc.IMPIProvider;

/**
 * MPIProxy的初始化包装器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class MPIProxyInitializer {

	@Autowired
	public void setMpiProvider(IMPIProvider mpiProvider) {
		MPIProxy.setMpiProvider(mpiProvider);
	}

}
