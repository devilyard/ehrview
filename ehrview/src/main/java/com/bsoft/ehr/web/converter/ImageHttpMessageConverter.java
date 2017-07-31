/*
 * @(#)ImageHttpMessageConverter.java Created on 2013年11月19日 上午10:57:19
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.web.converter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.util.FileCopyUtils;

import com.bsoft.ehr.web.type.Image;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ImageHttpMessageConverter extends
		AbstractHttpMessageConverter<Image> {

	public ImageHttpMessageConverter() {
		super(new MediaType("image", "octet-stream"), MediaType.ALL);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.http.converter.AbstractHttpMessageConverter#supports
	 * (java.lang.Class)
	 */
	@Override
	protected boolean supports(Class<?> clazz) {
		return Image.class.equals(clazz);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.http.converter.AbstractHttpMessageConverter#readInternal
	 * (java.lang.Class, org.springframework.http.HttpInputMessage)
	 */
	@Override
	protected Image readInternal(Class<? extends Image> clazz,
			HttpInputMessage inputMessage) throws IOException,
			HttpMessageNotReadableException {
		long contentLength = inputMessage.getHeaders().getContentLength();
		Image image = new Image();
		if (contentLength >= 0) {
			ByteArrayOutputStream bos = new ByteArrayOutputStream(
					(int) contentLength);
			FileCopyUtils.copy(inputMessage.getBody(), bos);
			image.setData(bos.toByteArray());
		} else {
			image.setData(FileCopyUtils.copyToByteArray(inputMessage.getBody()));
		}
		MediaType mediaType = inputMessage.getHeaders().getContentType();
		if (mediaType != null) {
			image.setType(mediaType.getSubtype());
		}
		return image;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.http.converter.AbstractHttpMessageConverter#
	 * getContentLength(java.lang.Object, org.springframework.http.MediaType)
	 */
	@Override
	protected Long getContentLength(Image image, MediaType contentType) {
		return (long) image.getData().length;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.http.converter.AbstractHttpMessageConverter#writeInternal
	 * (java.lang.Object, org.springframework.http.HttpOutputMessage)
	 */
	@Override
	protected void writeInternal(Image t, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {
		MediaType mediaType;
		if (t.getType() != null) {
			String[] types = t.getType().split("/");
			mediaType = new MediaType(types[0], types[1]);
		} else {
			mediaType = new MediaType("image", "jpeg");
		}
		outputMessage.getHeaders().setContentType(mediaType);
		FileCopyUtils.copy(t.getData(), outputMessage.getBody());
	}
}
