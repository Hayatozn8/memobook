package com.ljs.learn.ioc.springBaseImprove.dao;

public class UserDaoMySqlImpl implements UserDao {
    @Override
    public String getUserName() {
        return "Mysql User";
    }
}