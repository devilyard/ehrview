package com.bsoft.xds.exception;

public class DocumentEntryException extends Exception {
	protected static final long serialVersionUID = -8481811634176212223L;
	protected int code = 500;

	public static int RECORD_NOT_EXISTS = 404;
	public static int RECORD_DOC_NOT_EXISTS = 405;
	public static int UNKNOW_ERROR = 500;
	public static int DATABASE_CONNECT_FAILED = 501;
	public static int DATABASE_ACCESS_FAILED = 502;
	public static int DOCUMENT_FORMAT_FAILED = 503;
	public static int ARGUMENTS_ERROR = 504;
	public static int FORMAT_NOT_SUPPORT = 504;
	public static int LIMIT_MAX_EXCEED = 505;
	public static int PERIOD_RANGE_EXCEED = 506;
	public static int DOCUMENT_COMPRESSION_NOT_SUPPORTED = 507;
	public static int DOCUMENT_COMPRESS_FAILED = 508;
	public static int DOCUMENT_VALIDATION_FAILED = 509;
	public static int ENCODING_NOT_SUPPORTED = 510;
	public static int DOCUMENT_PARSE_ERROR = 511;
	public static int ID_GENERATE_FAILED = 600;
	public static int DOCUMENT_FORMAT_ERROR = 700;
	public static int MPI_FAILED = 702;
	public static int MPI_NOT_FOUND = 701;

	public DocumentEntryException(int code) {
		this.code = code;
	}

	public DocumentEntryException(String msg) {
		super(msg);
	}

	public DocumentEntryException(int code, String msg) {
		super(msg);
		this.code = code;
	}

	public DocumentEntryException(Throwable e) {
		super(e);
	}

	public DocumentEntryException(int code, Throwable e) {
		super(e);
		this.code = code;
	}

	public DocumentEntryException(String msg, Throwable e) {
		super(msg, e);
	}

	public DocumentEntryException(int code, String msg, Throwable e) {
		super(msg, e);
		this.code = code;
	}

	public int getCode() {
		return code;
	}
}
