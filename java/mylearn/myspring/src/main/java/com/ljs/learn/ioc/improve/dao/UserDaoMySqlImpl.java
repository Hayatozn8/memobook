package com.ljs.learn.ioc.improve.dao;

public class UserDaoMySqlImpl implements UserDao {
    @Override
    public String getUserName() {
        return "Mysql User";
    }
}
