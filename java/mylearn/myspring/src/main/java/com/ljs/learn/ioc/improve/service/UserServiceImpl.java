package com.ljs.learn.ioc.improve.service;

import com.ljs.learn.ioc.improve.dao.UserDao;
import com.ljs.learn.ioc.improve.dao.UserDaoOracleImpl;

public class UserServiceImpl implements UserService {

    // 将组合dao改为聚合dao，并在构造器或setter中完成依赖关系的传递
    private UserDao dao;

    public UserServiceImpl(UserDao dao) {
        this.dao = dao;
    }

    public void setDao(UserDao dao) {
        this.dao = dao;
    }

    @Override
    public void printUserName() {
        System.out.println(dao.getUserName());
    }
}
