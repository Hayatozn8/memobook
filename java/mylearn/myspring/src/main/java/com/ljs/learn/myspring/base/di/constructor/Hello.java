package com.ljs.learn.myspring.base.di.constructor;

public class Hello {
    private String name;
    private String address;

    public Hello(String n, String a) {
        this.name = n;
        this.address = a;

        System.out.println(n + " Constructor");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "Hello{" +
                "name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
