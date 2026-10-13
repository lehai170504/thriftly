package com.ecommerce.thriftauction.core.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.pattern.CompositeConverter;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MaskingMessageConverter extends CompositeConverter<ILoggingEvent> {

    private static final Pattern SENSITIVE_KEY_VALUE_PATTERN = Pattern.compile(
            "(?i)(password|token|secret|apikey|refreshtoken|accesskey|privatekey)\\s*[:=]\\s*[\"']?([^\"'\\s,;&]+)[\"']?");

    private static final Pattern JWT_PATTERN = Pattern.compile(
            "eyJ[A-Za-z0-9-_]+\\.eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+");

    private static final Pattern BEARER_PATTERN = Pattern.compile(
            "(?i)bearer\\s+[A-Za-z0-9\\-._~+/]+=*");

    private static final Pattern AUTHORIZATION_PATTERN = Pattern.compile(
            "(?i)(authorization\\s*[:=]\\s*)(?!bearer\\s+\\*\\*\\*)[^\\s,;&]+");

    @Override
    protected String transform(ILoggingEvent event, String in) {
        return mask(in);
    }

    public String mask(String message) {
        if (message == null || message.isEmpty()) {
            return message;
        }

        String result = BEARER_PATTERN.matcher(message).replaceAll("Bearer ***");
        result = JWT_PATTERN.matcher(result).replaceAll("[REDACTED_JWT]");
        result = AUTHORIZATION_PATTERN.matcher(result).replaceAll("$1***");

        Matcher matcher = SENSITIVE_KEY_VALUE_PATTERN.matcher(result);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String key = matcher.group(1);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(key + "=***"));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
