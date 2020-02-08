package com.ljs.learn.annotation.customize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE_PARAMETER})
public @interface Myannotation {
    String value() default "hello";
}
