import Main from '@/components/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [{
        path: '/login',
        name: 'login',
        meta: {
            title: 'Login - 登录',
            hideInMenu: true
        },
        component: () =>
            import ('@/view/login/login.vue')
    },
    {
        path: '/',
        name: '_home',
        redirect: '/home',
        component: Main,
        meta: {
            hideInMenu: true,
            notCache: true
        },
        children: [{
            path: '/home',
            name: 'home',
            meta: {
                hideInMenu: true,
                title: '首页',
                notCache: true
            },
            component: () =>
                import ('@/view/single-page/home')
        }]
    },

    {
        path: '/lease',
        name: 'lease',
        meta: {
            icon: 'logo-buffer',
            title: '租赁管理'
        },
        component: Main,
        children: [{
                path: 'enterprise',
                name: '园区企业管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '园区企业管理'
                },
                component: () =>
                    import ('@/view/lease/enterprise.vue')
            },
            {
                path: 'room',
                name: '办公室管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '办公室管理'
                },
                component: () =>
                    import ('@/view/lease/room.vue')
            },
            {
                path: 'warehouse',
                name: '仓办管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '仓办管理'
                },
                component: () =>
                    import ('@/view/lease/warehouse.vue')
            },
            {
                path: 'business',
                name: '商业管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '商业管理'
                },
                component: () =>
                    import ('@/view/lease/business.vue')
            }

        ]
    },
    {
        path: '/dormitorymanage',
        name: 'dormitorymanage',
        meta: {
            icon: 'logo-buffer',
            title: '宿舍管理'
        },
        component: Main,
        children: [{
                path: 'roomtype',
                name: '宿舍房型租金设置',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '宿舍房间租金设置'
                },
                component: () =>
                    import ('@/view/dormitorymanage/roomtype.vue')
            },
            {
                path: 'room',
                name: '宿舍房间设置',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '宿舍房间设置'
                },
                component: () =>
                    import ('@/view/dormitorymanage/room.vue')
            }
        ]

    },
    
    {
        path: '/contract',
        name: 'contract',
        meta: {
            icon: 'logo-buffer',
            title: '合同管理'
        },
        component: Main,
        children: [{
                path: 'dormitorymanage',
                name: '宿舍合同管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '宿舍合同管理'
                },
                component: () =>
                    import ('@/view/dormitorymanage/dormitorymanage.vue')
            },
            {
                path: 'lease',
                name: '租赁信息管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '租赁信息管理'
                },
                component: () =>
                    import ('@/view/lease/lease.vue')
            }

        ]
    },
    {
        path: '/sousoumanage',
        name: 'sousoumanage',
        meta: {
            icon: 'logo-buffer',
            title: '嗖嗖鸟管理'
        },
        component: Main,
        children: [{
                path: 'sousouclient',
                name: '嗖嗖鸟客户',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '嗖嗖鸟客户'
                },
                component: () =>
                    import ('@/view/sousoumanage/sousouclient.vue')
            },
            {
                path: 'sousouallcontract',
                name: '嗖嗖鸟合同',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '嗖嗖鸟合同'
                },
                component: () =>
                    import ('@/view/sousoumanage/sousouallcontract.vue')
            }
        ]

    },
    {
        path: "/payment",
        name: "payment",
        meta: {
            icon: "logo-buffer",
            title: "缴费管理"
        },
        component: Main,
        children: [{
            path: "payment",
            name: "缴费管理",
            meta: {
                icon: "md-arrow-dropdown-circle",
                title: "缴费管理"
            },
            component: () =>
                import ("@/view/payment/payment.vue")
        }]
    },
    {
        path: '/systemSet',
        name: 'systemSet',
        meta: {
            icon: 'logo-buffer',
            title: '系统设置'
        },
        component: Main,
        children: [{
                path: 'building',
                name: '楼栋管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '楼栋管理'
                },
                component: () =>
                    import ('@/view/lease/building.vue')
            },
            {
                path: 'user',
                name: '用户管理',
                meta: {
                    icon: 'md-arrow-dropdown-circle',
                    title: '用户管理'
                },
                component: () =>
                    import ('@/view/systemSet/user.vue')
            },
            {
                path: "setting",
                name: "后台设置",
                meta: {
                    icon: "md-arrow-dropdown-circle",
                    title: "后台设置"
                },
                component: () =>
                    import ("@/view/payment/setting.vue")
            }
        ]
    },


    {
        path: '/401',
        name: 'error_401',
        meta: {
            hideInMenu: true
        },
        component: () =>
            import ('@/view/error-page/401.vue')
    },
    {
        path: '/500',
        name: 'error_500',
        meta: {
            hideInMenu: true
        },
        component: () =>
            import ('@/view/error-page/500.vue')
    },
    {
        path: '*',
        name: 'error_404',
        meta: {
            hideInMenu: true
        },
        component: () =>
            import ('@/view/error-page/404.vue')
    }
]