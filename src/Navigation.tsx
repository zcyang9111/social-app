import * as React from 'react'
import {StyleSheet} from 'react-native'
import {
  NavigationContainer,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {
  HomeTabNavigatorParams,
  SearchTabNavigatorParams,
  NotificationsTabNavigatorParams,
  FlatNavigatorParams,
  AllNavigatorParams,
} from 'lib/routes/types'
import {BottomBar} from './view/shell/BottomBar'
import {buildStateObject} from 'lib/routes/helpers'
import {State, RouteParams} from 'lib/routes/types'
import {colors} from 'lib/styles'
import {isNative} from 'platform/detection'
import {useColorSchemeStyle} from 'lib/hooks/useColorSchemeStyle'
import {router} from './routes'

import {HomeScreen} from './view/screens/Home'
import {SearchScreen} from './view/screens/Search'
import {NotificationsScreen} from './view/screens/Notifications'
import {NotFoundScreen} from './view/screens/NotFound'
import {SettingsScreen} from './view/screens/Settings'
import {ProfileScreen} from './view/screens/Profile'
import {ProfileFollowersScreen} from './view/screens/ProfileFollowers'
import {ProfileFollowsScreen} from './view/screens/ProfileFollows'
import {PostThreadScreen} from './view/screens/PostThread'
import {PostUpvotedByScreen} from './view/screens/PostUpvotedBy'
import {PostRepostedByScreen} from './view/screens/PostRepostedBy'
import {DebugScreen} from './view/screens/Debug'
import {LogScreen} from './view/screens/Log'
import {SupportScreen} from './view/screens/Support'
import {PrivacyPolicyScreen} from './view/screens/PrivacyPolicy'

const navigationRef = createNavigationContainerRef<AllNavigatorParams>()

const HomeTab = createNativeStackNavigator<HomeTabNavigatorParams>()
const SearchTab = createNativeStackNavigator<SearchTabNavigatorParams>()
const NotificationsTab =
  createNativeStackNavigator<NotificationsTabNavigatorParams>()
const Flat = createNativeStackNavigator<FlatNavigatorParams>()
const Tab = createBottomTabNavigator()

/**
 * These "common screens" are reused across stacks.
 */
function commonScreens(Stack: typeof HomeTab) {
  return (
    <>
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ProfileFollowers"
        component={ProfileFollowersScreen}
      />
      <Stack.Screen name="ProfileFollows" component={ProfileFollowsScreen} />
      <Stack.Screen name="PostThread" component={PostThreadScreen} />
      <Stack.Screen name="PostUpvotedBy" component={PostUpvotedByScreen} />
      <Stack.Screen name="PostRepostedBy" component={PostRepostedByScreen} />
      <Stack.Screen name="Debug" component={DebugScreen} />
      <Stack.Screen name="Log" component={LogScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </>
  )
}

/**
 * The TabsNavigator is used by native mobile to represent the routes
 * in 3 distinct tab-stacks with a different root screen on each.
 */
function TabsNavigator() {
  const tabBar = React.useCallback(props => <BottomBar {...props} />, [])
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      backBehavior="initialRoute"
      screenOptions={{headerShown: false}}
      tabBar={tabBar}>
      <Tab.Screen name="HomeTab" component={HomeTabNavigator} />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsTabNavigator}
      />
      <Tab.Screen name="SearchTab" component={SearchTabNavigator} />
    </Tab.Navigator>
  )
}

function HomeTabNavigator() {
  const contentStyle = useColorSchemeStyle(styles.bgLight, styles.bgDark)
  return (
    <HomeTab.Navigator
      screenOptions={{
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerShown: false,
        animationDuration: 250,
        contentStyle,
      }}>
      <HomeTab.Screen name="Home" component={HomeScreen} />
      {commonScreens(HomeTab)}
    </HomeTab.Navigator>
  )
}

function SearchTabNavigator() {
  const contentStyle = useColorSchemeStyle(styles.bgLight, styles.bgDark)
  return (
    <SearchTab.Navigator
      screenOptions={{
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerShown: false,
        animationDuration: 250,
        contentStyle,
      }}>
      <SearchTab.Screen name="Search" component={SearchScreen} />
      {commonScreens(SearchTab as typeof HomeTab)}
    </SearchTab.Navigator>
  )
}

function NotificationsTabNavigator() {
  const contentStyle = useColorSchemeStyle(styles.bgLight, styles.bgDark)
  return (
    <NotificationsTab.Navigator
      screenOptions={{
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerShown: false,
        animationDuration: 250,
        contentStyle,
      }}>
      <NotificationsTab.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      {commonScreens(NotificationsTab as typeof HomeTab)}
    </NotificationsTab.Navigator>
  )
}

/**
 * The FlatNavigator is used by Web to represent the routes
 * in a single ("flat") stack.
 */
function FlatNavigator() {
  return (
    <Flat.Navigator
      screenOptions={{
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerShown: false,
        animationDuration: 250,
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Flat.Screen name="Home" component={HomeScreen} />
      <Flat.Screen name="Search" component={SearchScreen} />
      <Flat.Screen name="Notifications" component={NotificationsScreen} />
      {commonScreens(Flat as typeof HomeTab)}
    </Flat.Navigator>
  )
}

/**
 * The RoutesContainer should wrap all components which need access
 * to the navigation context.
 */

const LINKING = {
  prefixes: ['bsky://', 'https://bsky.app'],

  getPathFromState(state: State) {
    // find the current node in the navigation tree
    let node = state.routes[state.index || 0]
    while (node.state?.routes && typeof node.state?.index === 'number') {
      node = node.state?.routes[node.state?.index]
    }

    // build the path
    const route = router.matchName(node.name)
    if (typeof route === 'undefined') {
      return '/' // default to home
    }
    return route.build((node.params || {}) as RouteParams)
  },

  getStateFromPath(path: string) {
    const [name, params] = router.matchPath(path)
    if (isNative) {
      if (name === 'Search') {
        return buildStateObject('SearchTab', 'Search', params)
      }
      if (name === 'Notifications') {
        return buildStateObject('NotificationsTab', 'Notifications', params)
      }
      return buildStateObject('HomeTab', name, params)
    } else {
      return buildStateObject('Flat', name, params)
    }
  },
}

function RoutesContainer({children}: React.PropsWithChildren<{}>) {
  return (
    <NavigationContainer ref={navigationRef} linking={LINKING}>
      {children}
    </NavigationContainer>
  )
}

/**
 * These helpers can be used from outside of the RoutesContainer
 * (eg in the state models).
 */

function navigate<K extends keyof AllNavigatorParams>(
  name: K,
  params?: AllNavigatorParams[K],
) {
  if (navigationRef.isReady()) {
    // @ts-ignore I dont know what would make typescript happy but I have a life -prf
    navigationRef.navigate(name, params)
  }
}

function resetToTab(tabName: 'HomeTab' | 'SearchTab' | 'NotificationsTab') {
  if (navigationRef.isReady()) {
    navigate(tabName)
    navigationRef.dispatch(StackActions.popToTop())
  }
}

function handleLink(url: string) {
  let path
  if (url.startsWith('/')) {
    path = url
  } else if (url.startsWith('http')) {
    try {
      path = new URL(url).pathname
    } catch (e) {
      console.error('Invalid url', url, e)
      return
    }
  } else {
    console.error('Invalid url', url)
    return
  }

  const [name, params] = router.matchPath(path)
  if (isNative) {
    if (name === 'Search') {
      resetToTab('SearchTab')
    } else if (name === 'Notifications') {
      resetToTab('NotificationsTab')
    } else {
      resetToTab('HomeTab')
      // @ts-ignore matchPath doesnt give us type-checked output -prf
      navigate(name, params)
    }
  } else {
    // @ts-ignore matchPath doesnt give us type-checked output -prf
    navigate(name, params)
  }
}

const styles = StyleSheet.create({
  bgDark: {
    backgroundColor: colors.black,
  },
  bgLight: {
    backgroundColor: colors.gray1,
  },
})

export {
  navigate,
  resetToTab,
  handleLink,
  TabsNavigator,
  FlatNavigator,
  RoutesContainer,
}