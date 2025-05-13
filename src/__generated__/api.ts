

import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from 'graphql-tag'

/* tslint:disable */
/* eslint-disable */

const VariableName = ' $1fcbcbff-3e78-462f-b45c-668a3e09bfd8'

const ScalarBrandingField = ' $1fcbcbff-3e78-462f-b45c-668a3e09bfd9'

type CustomScalar<T> = { [ScalarBrandingField]: T }

class Variable<T, Name extends string> {
  private [VariableName]: Name
  // @ts-ignore
  private _type?: T

  // @ts-ignore
  constructor(name: Name, private readonly isRequired?: boolean) {
    this[VariableName] = name
  }
}

type ArrayInput<I> = [I] extends [$Atomic] ? never : ReadonlyArray<VariabledInput<I>>

type AllowedInlineScalars<S> = S extends string | number ? S : never

export type UnwrapCustomScalars<T> = T extends CustomScalar<infer S>
  ? S
  : T extends ReadonlyArray<infer I>
  ? ReadonlyArray<UnwrapCustomScalars<I>>
  : T extends Record<string, any>
  ? { [K in keyof T]: UnwrapCustomScalars<T[K]> }
  : T

type VariableWithoutScalars<T, Str extends string> = Variable<UnwrapCustomScalars<T>, Str>

// the array wrapper prevents distributive conditional types
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type VariabledInput<T> = [T] extends [CustomScalar<infer S> | null | undefined]
  ? // scalars only support variable input
    Variable<S | null | undefined, any> | AllowedInlineScalars<S> | null | undefined
  : [T] extends [CustomScalar<infer S>]
  ? Variable<S, any> | AllowedInlineScalars<S>
  : [T] extends [$Atomic]
  ? Variable<T, any> | T
  : T extends ReadonlyArray<infer I>
  ? VariableWithoutScalars<T, any> | T | ArrayInput<I>
  : T extends Record<string, any> | null | undefined
  ?
      | VariableWithoutScalars<T | null | undefined, any>
      | null
      | undefined
      | { [K in keyof T]: VariabledInput<T[K]> }
      | T
  : T extends Record<string, any>
  ? VariableWithoutScalars<T, any> | { [K in keyof T]: VariabledInput<T[K]> } | T
  : never

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

/**
 * Creates a new query variable
 *
 * @param name The variable name
 */
export const $ = <Type, Name extends string>(name: Name): Variable<Type, Name> => {
  return new Variable(name)
}

/**
 * Creates a new query variable. A value will be required even if the input is optional
 *
 * @param name The variable name
 */
export const $$ = <Type, Name extends string>(name: Name): Variable<NonNullable<Type>, Name> => {
  return new Variable(name, true)
}

type SelectOptions = {
  argTypes?: { [key: string]: string }
  args?: { [key: string]: any }
  selection?: Selection<any>
}

class $Field<Name extends string, Type, Vars = {}> {
  public kind: 'field' = 'field'
  public type!: Type

  public vars!: Vars
  public alias: string | null = null

  constructor(public name: Name, public options: SelectOptions) {}

  as<Rename extends string>(alias: Rename): $Field<Rename, Type, Vars> {
    const f = new $Field(this.name, this.options)
    f.alias = alias
    return f as any
  }
}

class $Base<Name extends string> {
  // @ts-ignore
  constructor(private $$name: Name) {}

  protected $_select<Key extends string>(
    name: Key,
    options: SelectOptions = {}
  ): $Field<Key, any, any> {
    return new $Field(name, options)
  }
}

// @ts-ignore
class $Union<T, Name extends String> extends $Base<Name> {
  // @ts-ignore
  private $$type!: T
  // @ts-ignore
  private $$name!: Name

  constructor(private selectorClasses: { [K in keyof T]: { new (): T[K] } }, $$name: Name) {
    super($$name)
  }

  $on<Type extends keyof T, Sel extends Selection<T[Type]>>(
    alternative: Type,
    selectorFn: (selector: T[Type]) => [...Sel]
  ): $UnionSelection<GetOutput<Sel>, GetVariables<Sel>> {
    const selection = selectorFn(new this.selectorClasses[alternative]())

    return new $UnionSelection(alternative as string, selection)
  }
}

// @ts-ignore
class $Interface<T, Name extends string> extends $Base<Name> {
  // @ts-ignore
  private $$type!: T
  // @ts-ignore
  private $$name!: Name

  constructor(private selectorClasses: { [K in keyof T]: { new (): T[K] } }, $$name: Name) {
    super($$name)
  }
  $on<Type extends keyof T, Sel extends Selection<T[Type]>>(
    alternative: Type,
    selectorFn: (selector: T[Type]) => [...Sel]
  ): $UnionSelection<GetOutput<Sel>, GetVariables<Sel>> {
    const selection = selectorFn(new this.selectorClasses[alternative]())

    return new $UnionSelection(alternative as string, selection)
  }
}

class $UnionSelection<T, Vars> {
  public kind: 'union' = 'union'
  // @ts-ignore
  private vars!: Vars
  constructor(public alternativeName: string, public alternativeSelection: Selection<T>) {}
}

type Selection<_any> = ReadonlyArray<$Field<any, any, any> | $UnionSelection<any, any>>

type NeverNever<T> = [T] extends [never] ? {} : T

type Simplify<T> = { [K in keyof T]: T[K] } & {}

type LeafType<T> = T extends CustomScalar<infer S> ? S : T

export type GetOutput<X extends Selection<any>> = Simplify<
  UnionToIntersection<
    {
      [I in keyof X]: X[I] extends $Field<infer Name, infer Type, any>
        ? { [K in Name]: LeafType<Type> }
        : never
    }[keyof X & number]
  > &
    NeverNever<
      {
        [I in keyof X]: X[I] extends $UnionSelection<infer Type, any> ? LeafType<Type> : never
      }[keyof X & number]
    >
>

type PossiblyOptionalVar<VName extends string, VType> = null extends VType
  ? { [key in VName]?: VType }
  : { [key in VName]: VType }

type ExtractInputVariables<Inputs> = Inputs extends Variable<infer VType, infer VName>
  ? PossiblyOptionalVar<VName, VType>
  : // Avoid generating an index signature for possibly undefined or null inputs.
  // The compiler incorrectly infers null or undefined, and we must force access the Inputs
  // type to convince the compiler its "never", while still retaining {} as the result
  // for null and undefined cases
  // Works around issue 79
  Inputs extends null | undefined
  ? { [K in keyof Inputs]: Inputs[K] }
  : Inputs extends $Atomic
  ? {}
  : Inputs extends any[] | readonly any[]
  ? UnionToIntersection<
      { [K in keyof Inputs]: ExtractInputVariables<Inputs[K]> }[keyof Inputs & number]
    >
  : UnionToIntersection<{ [K in keyof Inputs]: ExtractInputVariables<Inputs[K]> }[keyof Inputs]>

export type GetVariables<Sel extends Selection<any>, ExtraVars = {}> = UnionToIntersection<
  {
    [I in keyof Sel]: Sel[I] extends $Field<any, any, infer Vars>
      ? Vars
      : Sel[I] extends $UnionSelection<any, infer Vars>
      ? Vars
      : never
  }[keyof Sel & number]
> &
  ExtractInputVariables<ExtraVars>

type ArgVarType = {
  type: string
  isRequired: boolean
  array: {
    isRequired: boolean
  } | null
}

const arrRegex = /\[(.*?)\]/

/**
 * Converts graphql string type to `ArgVarType`
 * @param input
 * @returns
 */
function getArgVarType(input: string): ArgVarType {
  const array = input.includes('[')
    ? {
        isRequired: input.endsWith('!'),
      }
    : null

  const type = array ? arrRegex.exec(input)![1]! : input
  const isRequired = type.endsWith('!')

  return {
    array,
    isRequired: isRequired,
    type: type.replace('!', ''),
  }
}

function fieldToQuery(prefix: string, field: $Field<any, any, any>) {
  const variables = new Map<string, { variable: Variable<any, any>; type: ArgVarType }>()

  function stringifyArgs(
    args: any,
    argTypes: { [key: string]: string },
    argVarType?: ArgVarType
  ): string {
    switch (typeof args) {
      case 'string':
        const cleanType = argVarType!.type
        if ($Enums.has(cleanType!)) return args
        else return JSON.stringify(args)
      case 'number':
      case 'boolean':
        return JSON.stringify(args)
      default:
        if (args == null) return 'null'
        if (VariableName in (args as any)) {
          if (!argVarType)
            throw new globalThis.Error('Cannot use variabe as sole unnamed field argument')
          const variable = args as Variable<any, any>
          const argVarName = variable[VariableName]
          variables.set(argVarName, { type: argVarType, variable: variable })
          return '$' + argVarName
        }
        if (Array.isArray(args))
          return '[' + args.map(arg => stringifyArgs(arg, argTypes, argVarType)).join(',') + ']'
        const wrapped = (content: string) => (argVarType ? '{' + content + '}' : content)
        return wrapped(
          Array.from(Object.entries(args))
            .map(([key, val]) => {
              let argTypeForKey = argTypes[key]
              if (!argTypeForKey) {
                throw new globalThis.Error(`Argument type for ${key} not found`)
              }
              const cleanType = argTypeForKey.replace('[', '').replace(']', '').replace(/!/g, '')
              return (
                key +
                ':' +
                stringifyArgs(val, $InputTypes[cleanType]!, getArgVarType(argTypeForKey))
              )
            })
            .join(',')
        )
    }
  }

  function extractTextAndVars(field: $Field<any, any, any> | $UnionSelection<any, any>) {
    if (field.kind === 'field') {
      let retVal = field.name
      if (field.alias) retVal = field.alias + ':' + retVal
      const args = field.options.args,
        argTypes = field.options.argTypes
      if (args && Object.keys(args).length > 0) {
        retVal += '(' + stringifyArgs(args, argTypes!) + ')'
      }
      let sel = field.options.selection
      if (sel) {
        retVal += '{'
        for (let subField of sel) {
          retVal += extractTextAndVars(subField)
        }
        retVal += '}'
      }
      return retVal + ' '
    } else if (field.kind === 'union') {
      let retVal = '... on ' + field.alternativeName + ' {'
      for (let subField of field.alternativeSelection) {
        retVal += extractTextAndVars(subField)
      }
      retVal += '}'

      return retVal + ' '
    } else {
      throw new globalThis.Error('Uknown field kind')
    }
  }

  const queryRaw = extractTextAndVars(field)!

  const queryBody = queryRaw.substring(queryRaw.indexOf('{'))

  const varList = Array.from(variables.entries())
  let ret = prefix
  if (varList.length) {
    ret +=
      '(' +
      varList
        .map(([name, { type: kind, variable }]) => {
          let type = kind.array ? '[' : ''
          type += kind.type
          if (kind.isRequired) type += '!'
          if (kind.array) type += kind.array.isRequired ? ']!' : ']'

          if (!type.endsWith('!') && (variable as any).isRequired === true) {
            type += '!'
          }

          return '$' + name + ':' + type
        })
        .join(',') +
      ')'
  }
  ret += queryBody

  return ret
}

export type OutputTypeOf<T> = T extends $Interface<infer Subtypes, any>
  ? { [K in keyof Subtypes]: OutputTypeOf<Subtypes[K]> }[keyof Subtypes]
  : T extends $Union<infer Subtypes, any>
  ? { [K in keyof Subtypes]: OutputTypeOf<Subtypes[K]> }[keyof Subtypes]
  : T extends $Base<any>
  ? { [K in keyof T]?: OutputTypeOf<T[K]> }
  : [T] extends [$Field<any, infer FieldType, any>]
  ? FieldType
  : [T] extends [(selFn: (arg: infer Inner) => any) => any]
  ? OutputTypeOf<Inner>
  : [T] extends [(args: any, selFn: (arg: infer Inner) => any) => any]
  ? OutputTypeOf<Inner>
  : never

export type QueryOutputType<T extends TypedDocumentNode<any>> = T extends TypedDocumentNode<
  infer Out
>
  ? Out
  : never

export type QueryInputType<T extends TypedDocumentNode<any>> = T extends TypedDocumentNode<
  any,
  infer In
>
  ? In
  : never

export function fragment<T, Sel extends Selection<T>>(
  GQLType: { new (): T },
  selectFn: (selector: T) => [...Sel]
) {
  return selectFn(new GQLType())
}

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never

// TS4.0+
type Push<T extends any[], V> = [...T, V]

// TS4.1+
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>

type AllFieldProperties<I> = {
  [K in keyof I]: I[K] extends $Field<infer Name, infer Type, any> ? $Field<Name, Type, any> : never
}

type ValueOf<T> = T[keyof T]

export type AllFields<T> = TuplifyUnion<ValueOf<AllFieldProperties<T>>>

export function all<I extends $Base<any>>(instance: I) {
  const prototype = Object.getPrototypeOf(instance)
  const allFields = Object.getOwnPropertyNames(prototype)
    .map(k => prototype[k])
    .filter(o => o?.kind === 'field')
    .map(o => o?.name) as (keyof typeof instance)[]
  return allFields.map(fieldName => instance?.[fieldName]) as any as AllFields<I>
}

// We use a dummy conditional type that involves GenericType to defer the compiler's inference of
// any possible variables nested in this type. This addresses a problem where variables are
// inferred with type unknown
// @ts-ignore
type ExactArgNames<GenericType, Constraint> = GenericType extends never
  ? never
  : [Constraint] extends [$Atomic | CustomScalar<any>]
  ? GenericType
  : Constraint extends ReadonlyArray<infer InnerConstraint>
  ? GenericType extends ReadonlyArray<infer Inner>
    ? ReadonlyArray<ExactArgNames<Inner, InnerConstraint>>
    : GenericType
  : GenericType & {
      [Key in keyof GenericType]: Key extends keyof Constraint
        ? ExactArgNames<GenericType[Key], Constraint[Key]>
        : never
    }

type $Atomic = MetricBucketTimeEnum | number | string | boolean | null | undefined

let $Enums = new Set<string>(["MetricBucketTimeEnum"])



/**
 * Add a pack to an organization's collection
 */
export type AddPackInstanceInput = {
  description?: string | null,
organizationId?: string | null,
packId: string
}
    


export class AddPackInstancePayload extends $Base<"AddPackInstancePayload"> {
  constructor() {
    super("AddPackInstancePayload")
  }

  
      
      packInstance<Sel extends Selection<PackInstance>>(selectorFn: (s: PackInstance) => [...Sel]):$Field<"packInstance", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PackInstance)
      };
      return this.$_select("packInstance", options as any) as any
    }
  
}


export class AsFloat extends $Base<"AsFloat"> {
  constructor() {
    super("AsFloat")
  }

  
      
      get value(): $Field<"value", number>  {
       return this.$_select("value") as any
      }
}


export class AsString extends $Base<"AsString"> {
  constructor() {
    super("AsString")
  }

  
      
      get value(): $Field<"value", string>  {
       return this.$_select("value") as any
      }
}


export class CanceledStripeSubscription extends $Base<"CanceledStripeSubscription"> {
  constructor() {
    super("CanceledStripeSubscription")
  }

  
      
      get organizationId(): $Field<"organizationId", string>  {
       return this.$_select("organizationId") as any
      }

      
      get stripeCustomerId(): $Field<"stripeCustomerId", string>  {
       return this.$_select("stripeCustomerId") as any
      }
}


/**
 * Change the configuration of a pack
 */
export type ChangePackConfigurationInput = {
  configuration?: string | null,
description?: string | null,
enabled?: boolean | null,
id: string
}
    


export class ChangePackConfigurationPayload extends $Base<"ChangePackConfigurationPayload"> {
  constructor() {
    super("ChangePackConfigurationPayload")
  }

  
      
      packInstance<Sel extends Selection<PackInstance>>(selectorFn: (s: PackInstance) => [...Sel]):$Field<"packInstance", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PackInstance)
      };
      return this.$_select("packInstance", options as any) as any
    }
  
}


export class ClerkUser extends $Base<"ClerkUser"> {
  constructor() {
    super("ClerkUser")
  }

  
      
/**
 * The email address of the user
 */
      get email(): $Field<"email", string | null>  {
       return this.$_select("email") as any
      }

      
/**
 * The first name of the user
 */
      get firstName(): $Field<"firstName", string | null>  {
       return this.$_select("firstName") as any
      }

      
/**
 * The ID of the user
 */
      get id(): $Field<"id", string | null>  {
       return this.$_select("id") as any
      }

      
/**
 * The last name of the user
 */
      get lastName(): $Field<"lastName", string | null>  {
       return this.$_select("lastName") as any
      }
}


/**
 * Create a new organization token
 */
export type CreateOrganizationTokenInput = {
  description?: string | null,
organizationId?: string | null
}
    


export class CreateOrganizationTokenPayload extends $Base<"CreateOrganizationTokenPayload"> {
  constructor() {
    super("CreateOrganizationTokenPayload")
  }

  
      
      createOrganizationToken<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"createOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("createOrganizationToken", options as any) as any
    }
  
}


/**
 * Returns information about the currently authenticated user. Can be used for verifying a connection
and credentials are set up successfully.
 */
export class Credentials extends $Base<"Credentials"> {
  constructor() {
    super("Credentials")
  }

  
      
      organization<Sel extends Selection<CredentialsOrganization>>(selectorFn: (s: CredentialsOrganization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new CredentialsOrganization)
      };
      return this.$_select("organization", options as any) as any
    }
  

      
      get role(): $Field<"role", string>  {
       return this.$_select("role") as any
      }

      
      user<Sel extends Selection<CredentialsUser>>(selectorFn: (s: CredentialsUser) => [...Sel]):$Field<"user", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new CredentialsUser)
      };
      return this.$_select("user", options as any) as any
    }
  
}


export class CredentialsOrganization extends $Base<"CredentialsOrganization"> {
  constructor() {
    super("CredentialsOrganization")
  }

  
      
      get clerkId(): $Field<"clerkId", string | null>  {
       return this.$_select("clerkId") as any
      }

      
      get clerkName(): $Field<"clerkName", string | null>  {
       return this.$_select("clerkName") as any
      }

      
      get clerkSlug(): $Field<"clerkSlug", string | null>  {
       return this.$_select("clerkSlug") as any
      }

      
      get id(): $Field<"id", string | null>  {
       return this.$_select("id") as any
      }

      
      get relayId(): $Field<"relayId", string | null>  {
       return this.$_select("relayId") as any
      }
}


export class CredentialsUser extends $Base<"CredentialsUser"> {
  constructor() {
    super("CredentialsUser")
  }

  
      
      get clerkId(): $Field<"clerkId", string | null>  {
       return this.$_select("clerkId") as any
      }

      
      get id(): $Field<"id", string | null>  {
       return this.$_select("id") as any
      }

      
      get relayId(): $Field<"relayId", string | null>  {
       return this.$_select("relayId") as any
      }
}


/**
 * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
 */
export type DateTime = string



/**
 * Delete an organization token
 */
export type DeleteOrganizationTokenInput = {
  id: string
}
    


export class DeleteOrganizationTokenPayload extends $Base<"DeleteOrganizationTokenPayload"> {
  constructor() {
    super("DeleteOrganizationTokenPayload")
  }

  
      
      deleteOrganizationToken<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"deleteOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("deleteOrganizationToken", options as any) as any
    }
  
}


export class FinishedStripeCheckoutSession extends $Base<"FinishedStripeCheckoutSession"> {
  constructor() {
    super("FinishedStripeCheckoutSession")
  }

  
      
      get organizationId(): $Field<"organizationId", string>  {
       return this.$_select("organizationId") as any
      }

      
      get stripeCustomerId(): $Field<"stripeCustomerId", string>  {
       return this.$_select("stripeCustomerId") as any
      }
}


export class Metric extends $Base<"Metric"> {
  constructor() {
    super("Metric")
  }

  
      
      aggregate<Sel extends Selection<MetricAggregate>>(selectorFn: (s: MetricAggregate) => [...Sel]):$Field<"aggregate", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new MetricAggregate)
      };
      return this.$_select("aggregate", options as any) as any
    }
  

      
      bucket<Sel extends Selection<MetricBucket>>(selectorFn: (s: MetricBucket) => [...Sel]):$Field<"bucket", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new MetricBucket)
      };
      return this.$_select("bucket", options as any) as any
    }
  

      
      dimensions<Args extends VariabledInput<{
        dimension: string
format: string,
      }>,Sel extends Selection<MetricDimension>>(args: ExactArgNames<Args, {
        dimension: string
format: string,
      }>, selectorFn: (s: MetricDimension) => [...Sel]):$Field<"dimensions", Array<GetOutput<Sel>> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              dimension: "String!",
format: "String!"
            },
        args,

        selection: selectorFn(new MetricDimension)
      };
      return this.$_select("dimensions", options as any) as any
    }
  

      
      series<Args extends VariabledInput<{
        query?: string | null,
      }>,Sel extends Selection<MetricDataPoint>>(args: ExactArgNames<Args, {
        query?: string | null,
      }>, selectorFn: (s: MetricDataPoint) => [...Sel]):$Field<"series", Array<GetOutput<Sel>> , GetVariables<Sel, Args>>
series<Sel extends Selection<MetricDataPoint>>(selectorFn: (s: MetricDataPoint) => [...Sel]):$Field<"series", Array<GetOutput<Sel>> , GetVariables<Sel>>
series(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              query: "String"
            },
        args,

        selection: selectorFn(new MetricDataPoint)
      };
      return this.$_select("series", options as any) as any
    }
  
}


export class MetricAggregate extends $Base<"MetricAggregate"> {
  constructor() {
    super("MetricAggregate")
  }

  
      
      get avg(): $Field<"avg", string | null>  {
       return this.$_select("avg") as any
      }

      
      get count(): $Field<"count", string | null>  {
       return this.$_select("count") as any
      }

      
      get p95(): $Field<"p95", string | null>  {
       return this.$_select("p95") as any
      }

      
      get p99(): $Field<"p99", string | null>  {
       return this.$_select("p99") as any
      }

      
      get sum(): $Field<"sum", string | null>  {
       return this.$_select("sum") as any
      }
}


export type MetricAggregateArgument = {
  avg?: string | null,
count?: string | null,
p95?: string | null,
p99?: string | null,
sum?: string | null
}
    


export class MetricBucket extends $Base<"MetricBucket"> {
  constructor() {
    super("MetricBucket")
  }

  
      
      get dimension(): $Field<"dimension", string | null>  {
       return this.$_select("dimension") as any
      }

      
      get time(): $Field<"time", MetricBucketTimeEnum | null>  {
       return this.$_select("time") as any
      }
}


export type MetricBucketArgument = {
  dimension?: string | null,
time?: MetricBucketTimeEnum | null
}
    

  
export enum MetricBucketTimeEnum {
  
  DAY = "DAY",

  HOUR = "HOUR"
}
  


export class MetricDataPoint extends $Base<"MetricDataPoint"> {
  constructor() {
    super("MetricDataPoint")
  }

  
      
      get bucket(): $Field<"bucket", string>  {
       return this.$_select("bucket") as any
      }

      
      get metric(): $Field<"metric", number>  {
       return this.$_select("metric") as any
      }
}


export class MetricDimension extends $Union<{AsFloat: AsFloat,AsString: AsString}, "MetricDimension"> {
  constructor() {
    super({AsFloat: AsFloat,AsString: AsString}, "MetricDimension")
  }
}


export type MetricTimeArgument = {
  end?: DateTime | null,
start?: DateTime | null
}
    


export class Mutation extends $Base<"Mutation"> {
  constructor() {
    super("Mutation")
  }

  
      
      addPackInstance<Args extends VariabledInput<{
        input: AddPackInstanceInput,
      }>,Sel extends Selection<AddPackInstancePayload>>(args: ExactArgNames<Args, {
        input: AddPackInstanceInput,
      }>, selectorFn: (s: AddPackInstancePayload) => [...Sel]):$Field<"addPackInstance", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "AddPackInstanceInput!"
            },
        args,

        selection: selectorFn(new AddPackInstancePayload)
      };
      return this.$_select("addPackInstance", options as any) as any
    }
  

      
      cancelStripeSubscription<Args extends VariabledInput<{
        organizationId?: string | null,
      }>,Sel extends Selection<CanceledStripeSubscription>>(args: ExactArgNames<Args, {
        organizationId?: string | null,
      }>, selectorFn: (s: CanceledStripeSubscription) => [...Sel]):$Field<"cancelStripeSubscription", GetOutput<Sel> | null , GetVariables<Sel, Args>>
cancelStripeSubscription<Sel extends Selection<CanceledStripeSubscription>>(selectorFn: (s: CanceledStripeSubscription) => [...Sel]):$Field<"cancelStripeSubscription", GetOutput<Sel> | null , GetVariables<Sel>>
cancelStripeSubscription(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              organizationId: "String"
            },
        args,

        selection: selectorFn(new CanceledStripeSubscription)
      };
      return this.$_select("cancelStripeSubscription", options as any) as any
    }
  

      
      changePackConfiguration<Args extends VariabledInput<{
        input: ChangePackConfigurationInput,
      }>,Sel extends Selection<ChangePackConfigurationPayload>>(args: ExactArgNames<Args, {
        input: ChangePackConfigurationInput,
      }>, selectorFn: (s: ChangePackConfigurationPayload) => [...Sel]):$Field<"changePackConfiguration", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "ChangePackConfigurationInput!"
            },
        args,

        selection: selectorFn(new ChangePackConfigurationPayload)
      };
      return this.$_select("changePackConfiguration", options as any) as any
    }
  

      
      createEcho<Args extends VariabledInput<{
        message: string,
      }>>(args: ExactArgNames<Args, {
        message: string,
      }>):$Field<"createEcho", boolean | null , GetVariables<[], Args>> {
      
      const options = {
        argTypes: {
              message: "String!"
            },
        args,

        
      };
      return this.$_select("createEcho", options as any) as any
    }
  

      
      createOrganizationToken<Args extends VariabledInput<{
        input: CreateOrganizationTokenInput,
      }>,Sel extends Selection<CreateOrganizationTokenPayload>>(args: ExactArgNames<Args, {
        input: CreateOrganizationTokenInput,
      }>, selectorFn: (s: CreateOrganizationTokenPayload) => [...Sel]):$Field<"createOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "CreateOrganizationTokenInput!"
            },
        args,

        selection: selectorFn(new CreateOrganizationTokenPayload)
      };
      return this.$_select("createOrganizationToken", options as any) as any
    }
  

      
      createStripeCheckoutSession<Args extends VariabledInput<{
        cancelUrl: string
sku: string
successUrl: string,
      }>,Sel extends Selection<StripeCheckoutSession>>(args: ExactArgNames<Args, {
        cancelUrl: string
sku: string
successUrl: string,
      }>, selectorFn: (s: StripeCheckoutSession) => [...Sel]):$Field<"createStripeCheckoutSession", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              cancelUrl: "String!",
sku: "String!",
successUrl: "String!"
            },
        args,

        selection: selectorFn(new StripeCheckoutSession)
      };
      return this.$_select("createStripeCheckoutSession", options as any) as any
    }
  

      
      deleteOrganizationToken<Args extends VariabledInput<{
        input: DeleteOrganizationTokenInput,
      }>,Sel extends Selection<DeleteOrganizationTokenPayload>>(args: ExactArgNames<Args, {
        input: DeleteOrganizationTokenInput,
      }>, selectorFn: (s: DeleteOrganizationTokenPayload) => [...Sel]):$Field<"deleteOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "DeleteOrganizationTokenInput!"
            },
        args,

        selection: selectorFn(new DeleteOrganizationTokenPayload)
      };
      return this.$_select("deleteOrganizationToken", options as any) as any
    }
  

      
      finishStripeCheckoutSession<Args extends VariabledInput<{
        sessionId: string,
      }>,Sel extends Selection<FinishedStripeCheckoutSession>>(args: ExactArgNames<Args, {
        sessionId: string,
      }>, selectorFn: (s: FinishedStripeCheckoutSession) => [...Sel]):$Field<"finishStripeCheckoutSession", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              sessionId: "String!"
            },
        args,

        selection: selectorFn(new FinishedStripeCheckoutSession)
      };
      return this.$_select("finishStripeCheckoutSession", options as any) as any
    }
  

      
      removePackInstance<Args extends VariabledInput<{
        input: RemovePackInstanceInput,
      }>,Sel extends Selection<RemovePackInstancePayload>>(args: ExactArgNames<Args, {
        input: RemovePackInstanceInput,
      }>, selectorFn: (s: RemovePackInstancePayload) => [...Sel]):$Field<"removePackInstance", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "RemovePackInstanceInput!"
            },
        args,

        selection: selectorFn(new RemovePackInstancePayload)
      };
      return this.$_select("removePackInstance", options as any) as any
    }
  

      
      resetOrganizationToken<Args extends VariabledInput<{
        input: ResetOrganizationTokenInput,
      }>,Sel extends Selection<ResetOrganizationTokenPayload>>(args: ExactArgNames<Args, {
        input: ResetOrganizationTokenInput,
      }>, selectorFn: (s: ResetOrganizationTokenPayload) => [...Sel]):$Field<"resetOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              input: "ResetOrganizationTokenInput!"
            },
        args,

        selection: selectorFn(new ResetOrganizationTokenPayload)
      };
      return this.$_select("resetOrganizationToken", options as any) as any
    }
  

      
/**
 * Request a URL to upload a pack file and manifest
 */
      uploadPack<Args extends VariabledInput<{
        manifestSize: number
packSize: number,
      }>,Sel extends Selection<UploadPackResponse>>(args: ExactArgNames<Args, {
        manifestSize: number
packSize: number,
      }>, selectorFn: (s: UploadPackResponse) => [...Sel]):$Field<"uploadPack", GetOutput<Sel> , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              manifestSize: "Int!",
packSize: "Int!"
            },
        args,

        selection: selectorFn(new UploadPackResponse)
      };
      return this.$_select("uploadPack", options as any) as any
    }
  

      
/**
 * Confirm the upload of a pack file and manifest
 */
      uploadPackConfirm<Args extends VariabledInput<{
        ticket: string,
      }>>(args: ExactArgNames<Args, {
        ticket: string,
      }>):$Field<"uploadPackConfirm", boolean , GetVariables<[], Args>> {
      
      const options = {
        argTypes: {
              ticket: "String!"
            },
        args,

        
      };
      return this.$_select("uploadPackConfirm", options as any) as any
    }
  
}


export class Node extends $Interface<{Organization: Organization,OrganizationSetting: OrganizationSetting,OrganizationToken: OrganizationToken,Pack: Pack,PackInstance: PackInstance,User: User}, "Node"> {
  constructor() {
    super({Organization: Organization,OrganizationSetting: OrganizationSetting,OrganizationToken: OrganizationToken,Pack: Pack,PackInstance: PackInstance,User: User}, "Node")
  }
  
      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }
}


/**
 * A Taskless Organization
 */
export class Organization extends $Base<"Organization"> {
  constructor() {
    super("Organization")
  }

  
      
      get clerkId(): $Field<"clerkId", string>  {
       return this.$_select("clerkId") as any
      }

      
      get createdAt(): $Field<"createdAt", DateTime>  {
       return this.$_select("createdAt") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string | null>  {
       return this.$_select("localId") as any
      }

      
      packs<Sel extends Selection<PackInstance>>(selectorFn: (s: PackInstance) => [...Sel]):$Field<"packs", Array<GetOutput<Sel>> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PackInstance)
      };
      return this.$_select("packs", options as any) as any
    }
  

      
      settings<Args extends VariabledInput<{
        keys?: Readonly<Array<string>> | null,
      }>,Sel extends Selection<OrganizationSetting>>(args: ExactArgNames<Args, {
        keys?: Readonly<Array<string>> | null,
      }>, selectorFn: (s: OrganizationSetting) => [...Sel]):$Field<"settings", Array<GetOutput<Sel>> | null , GetVariables<Sel, Args>>
settings<Sel extends Selection<OrganizationSetting>>(selectorFn: (s: OrganizationSetting) => [...Sel]):$Field<"settings", Array<GetOutput<Sel>> | null , GetVariables<Sel>>
settings(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              keys: "[String!]"
            },
        args,

        selection: selectorFn(new OrganizationSetting)
      };
      return this.$_select("settings", options as any) as any
    }
  

      
/**
 * The Stripe Customer ID asssociated with this organization
 */
      get stripeCustomerId(): $Field<"stripeCustomerId", string | null>  {
       return this.$_select("stripeCustomerId") as any
      }

      
      subscription<Sel extends Selection<StripeSubscription>>(selectorFn: (s: StripeSubscription) => [...Sel]):$Field<"subscription", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new StripeSubscription)
      };
      return this.$_select("subscription", options as any) as any
    }
  

      
/**
 * Get a collection of organization tokens
 */
      tokens<Args extends VariabledInput<{
        after?: string | null
before?: string | null
expired?: boolean | null
first?: number | null
last?: number | null,
      }>,Sel extends Selection<OrganizationTokensConnection>>(args: ExactArgNames<Args, {
        after?: string | null
before?: string | null
expired?: boolean | null
first?: number | null
last?: number | null,
      }>, selectorFn: (s: OrganizationTokensConnection) => [...Sel]):$Field<"tokens", GetOutput<Sel> | null , GetVariables<Sel, Args>>
tokens<Sel extends Selection<OrganizationTokensConnection>>(selectorFn: (s: OrganizationTokensConnection) => [...Sel]):$Field<"tokens", GetOutput<Sel> | null , GetVariables<Sel>>
tokens(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              after: "String",
before: "String",
expired: "Boolean",
first: "Int",
last: "Int"
            },
        args,

        selection: selectorFn(new OrganizationTokensConnection)
      };
      return this.$_select("tokens", options as any) as any
    }
  

      
      get updatedAt(): $Field<"updatedAt", DateTime>  {
       return this.$_select("updatedAt") as any
      }
}


/**
 * A setting for the organization
 */
export class OrganizationSetting extends $Base<"OrganizationSetting"> {
  constructor() {
    super("OrganizationSetting")
  }

  
      
      get createdAt(): $Field<"createdAt", DateTime>  {
       return this.$_select("createdAt") as any
      }

      
      get creator(): $Field<"creator", string | null>  {
       return this.$_select("creator") as any
      }

      
/**
 * A description of this setting
 */
      get description(): $Field<"description", string | null>  {
       return this.$_select("description") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The key for this setting
 */
      get key(): $Field<"key", string>  {
       return this.$_select("key") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string>  {
       return this.$_select("localId") as any
      }

      
      organization<Sel extends Selection<Organization>>(selectorFn: (s: Organization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Organization)
      };
      return this.$_select("organization", options as any) as any
    }
  

      
      get updatedAt(): $Field<"updatedAt", DateTime>  {
       return this.$_select("updatedAt") as any
      }

      
      value<Args extends VariabledInput<{
        format?: string | null,
      }>,Sel extends Selection<SettingValue>>(args: ExactArgNames<Args, {
        format?: string | null,
      }>, selectorFn: (s: SettingValue) => [...Sel]):$Field<"value", GetOutput<Sel> | null , GetVariables<Sel, Args>>
value<Sel extends Selection<SettingValue>>(selectorFn: (s: SettingValue) => [...Sel]):$Field<"value", GetOutput<Sel> | null , GetVariables<Sel>>
value(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              format: "String"
            },
        args,

        selection: selectorFn(new SettingValue)
      };
      return this.$_select("value", options as any) as any
    }
  
}


/**
 * A token for accessing the Taskless API on behalf of an organization
 */
export class OrganizationToken extends $Base<"OrganizationToken"> {
  constructor() {
    super("OrganizationToken")
  }

  
      
/**
 * The date and time this token was created
 */
      get createdAt(): $Field<"createdAt", DateTime>  {
       return this.$_select("createdAt") as any
      }

      
/**
 * A description of the token at the time of creation
 */
      get description(): $Field<"description", string | null>  {
       return this.$_select("description") as any
      }

      
/**
 * A boolean flag that marks a token as no longer valid
 */
      get expired(): $Field<"expired", boolean>  {
       return this.$_select("expired") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string | null>  {
       return this.$_select("localId") as any
      }

      
/**
 * The organization that owns this token
 */
      organization<Sel extends Selection<Organization>>(selectorFn: (s: Organization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Organization)
      };
      return this.$_select("organization", options as any) as any
    }
  

      
/**
 * The token value
 */
      get token(): $Field<"token", string>  {
       return this.$_select("token") as any
      }
}


export class OrganizationTokensConnection extends $Base<"OrganizationTokensConnection"> {
  constructor() {
    super("OrganizationTokensConnection")
  }

  
      
      edges<Sel extends Selection<OrganizationTokensConnectionEdge>>(selectorFn: (s: OrganizationTokensConnectionEdge) => [...Sel]):$Field<"edges", Array<GetOutput<Sel> | null> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationTokensConnectionEdge)
      };
      return this.$_select("edges", options as any) as any
    }
  

      
      pageInfo<Sel extends Selection<PageInfo>>(selectorFn: (s: PageInfo) => [...Sel]):$Field<"pageInfo", GetOutput<Sel> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PageInfo)
      };
      return this.$_select("pageInfo", options as any) as any
    }
  
}


export class OrganizationTokensConnectionEdge extends $Base<"OrganizationTokensConnectionEdge"> {
  constructor() {
    super("OrganizationTokensConnectionEdge")
  }

  
      
      get cursor(): $Field<"cursor", string>  {
       return this.$_select("cursor") as any
      }

      
      node<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"node", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("node", options as any) as any
    }
  
}


/**
 * A Taskless Pack
 */
export class Pack extends $Base<"Pack"> {
  constructor() {
    super("Pack")
  }

  
      
      get createdAt(): $Field<"createdAt", DateTime>  {
       return this.$_select("createdAt") as any
      }

      
      get description(): $Field<"description", string | null>  {
       return this.$_select("description") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string | null>  {
       return this.$_select("localId") as any
      }

      
      get manifest(): $Field<"manifest", string>  {
       return this.$_select("manifest") as any
      }

      
      get name(): $Field<"name", string>  {
       return this.$_select("name") as any
      }

      
      owner<Sel extends Selection<Organization>>(selectorFn: (s: Organization) => [...Sel]):$Field<"owner", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Organization)
      };
      return this.$_select("owner", options as any) as any
    }
  

      
      get public(): $Field<"public", boolean>  {
       return this.$_select("public") as any
      }

      
      get updatedAt(): $Field<"updatedAt", DateTime>  {
       return this.$_select("updatedAt") as any
      }

      
      get version(): $Field<"version", string>  {
       return this.$_select("version") as any
      }
}


/**
 * An organization's ownership and configuration of a given pack
 */
export class PackInstance extends $Base<"PackInstance"> {
  constructor() {
    super("PackInstance")
  }

  
      
      get configuration(): $Field<"configuration", string>  {
       return this.$_select("configuration") as any
      }

      
      get createdAt(): $Field<"createdAt", DateTime>  {
       return this.$_select("createdAt") as any
      }

      
      get description(): $Field<"description", string | null>  {
       return this.$_select("description") as any
      }

      
      get enabled(): $Field<"enabled", boolean>  {
       return this.$_select("enabled") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string>  {
       return this.$_select("localId") as any
      }

      
      organization<Sel extends Selection<Organization>>(selectorFn: (s: Organization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Organization)
      };
      return this.$_select("organization", options as any) as any
    }
  

      
      pack<Sel extends Selection<Pack>>(selectorFn: (s: Pack) => [...Sel]):$Field<"pack", GetOutput<Sel> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Pack)
      };
      return this.$_select("pack", options as any) as any
    }
  

      
      get updatedAt(): $Field<"updatedAt", DateTime>  {
       return this.$_select("updatedAt") as any
      }
}


export class PageInfo extends $Base<"PageInfo"> {
  constructor() {
    super("PageInfo")
  }

  
      
      get endCursor(): $Field<"endCursor", string | null>  {
       return this.$_select("endCursor") as any
      }

      
      get hasNextPage(): $Field<"hasNextPage", boolean>  {
       return this.$_select("hasNextPage") as any
      }

      
      get hasPreviousPage(): $Field<"hasPreviousPage", boolean>  {
       return this.$_select("hasPreviousPage") as any
      }

      
      get startCursor(): $Field<"startCursor", string | null>  {
       return this.$_select("startCursor") as any
      }
}


export class Query extends $Base<"Query"> {
  constructor() {
    super("Query")
  }

  
      
      credentials<Sel extends Selection<Credentials>>(selectorFn: (s: Credentials) => [...Sel]):$Field<"credentials", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Credentials)
      };
      return this.$_select("credentials", options as any) as any
    }
  

      
      echo<Args extends VariabledInput<{
        value: string,
      }>>(args: ExactArgNames<Args, {
        value: string,
      }>):$Field<"echo", string | null , GetVariables<[], Args>> {
      
      const options = {
        argTypes: {
              value: "String!"
            },
        args,

        
      };
      return this.$_select("echo", options as any) as any
    }
  

      
      metrics<Args extends VariabledInput<{
        aggregate: MetricAggregateArgument
bucket: MetricBucketArgument
range?: MetricTimeArgument | null,
      }>,Sel extends Selection<Metric>>(args: ExactArgNames<Args, {
        aggregate: MetricAggregateArgument
bucket: MetricBucketArgument
range?: MetricTimeArgument | null,
      }>, selectorFn: (s: Metric) => [...Sel]):$Field<"metrics", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              aggregate: "MetricAggregateArgument!",
bucket: "MetricBucketArgument!",
range: "MetricTimeArgument"
            },
        args,

        selection: selectorFn(new Metric)
      };
      return this.$_select("metrics", options as any) as any
    }
  

      
      node<Args extends VariabledInput<{
        id: string,
      }>,Sel extends Selection<Node>>(args: ExactArgNames<Args, {
        id: string,
      }>, selectorFn: (s: Node) => [...Sel]):$Field<"node", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              id: "ID!"
            },
        args,

        selection: selectorFn(new Node)
      };
      return this.$_select("node", options as any) as any
    }
  

      
      nodes<Args extends VariabledInput<{
        ids: Readonly<Array<string>>,
      }>,Sel extends Selection<Node>>(args: ExactArgNames<Args, {
        ids: Readonly<Array<string>>,
      }>, selectorFn: (s: Node) => [...Sel]):$Field<"nodes", Array<GetOutput<Sel> | null> , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              ids: "[ID!]!"
            },
        args,

        selection: selectorFn(new Node)
      };
      return this.$_select("nodes", options as any) as any
    }
  

      
      organization<Args extends VariabledInput<{
        id?: string | null,
      }>,Sel extends Selection<Organization>>(args: ExactArgNames<Args, {
        id?: string | null,
      }>, selectorFn: (s: Organization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel, Args>>
organization<Sel extends Selection<Organization>>(selectorFn: (s: Organization) => [...Sel]):$Field<"organization", GetOutput<Sel> | null , GetVariables<Sel>>
organization(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              id: "String"
            },
        args,

        selection: selectorFn(new Organization)
      };
      return this.$_select("organization", options as any) as any
    }
  

      
/**
 * Get a single organization setting
 */
      organizationSetting<Args extends VariabledInput<{
        id?: string | null,
      }>,Sel extends Selection<OrganizationSetting>>(args: ExactArgNames<Args, {
        id?: string | null,
      }>, selectorFn: (s: OrganizationSetting) => [...Sel]):$Field<"organizationSetting", GetOutput<Sel> | null , GetVariables<Sel, Args>>
organizationSetting<Sel extends Selection<OrganizationSetting>>(selectorFn: (s: OrganizationSetting) => [...Sel]):$Field<"organizationSetting", GetOutput<Sel> | null , GetVariables<Sel>>
organizationSetting(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              id: "String"
            },
        args,

        selection: selectorFn(new OrganizationSetting)
      };
      return this.$_select("organizationSetting", options as any) as any
    }
  

      
/**
 * Get a single organization token
 */
      organizationToken<Args extends VariabledInput<{
        id?: string | null,
      }>,Sel extends Selection<OrganizationToken>>(args: ExactArgNames<Args, {
        id?: string | null,
      }>, selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"organizationToken", GetOutput<Sel> | null , GetVariables<Sel, Args>>
organizationToken<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"organizationToken", GetOutput<Sel> | null , GetVariables<Sel>>
organizationToken(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              id: "String"
            },
        args,

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("organizationToken", options as any) as any
    }
  

      
/**
 * Get a collection of organization tokens
 */
      organizationTokens<Args extends VariabledInput<{
        after?: string | null
before?: string | null
expired?: boolean | null
first?: number | null
last?: number | null
orgId?: string | null,
      }>,Sel extends Selection<QueryOrganizationTokensConnection>>(args: ExactArgNames<Args, {
        after?: string | null
before?: string | null
expired?: boolean | null
first?: number | null
last?: number | null
orgId?: string | null,
      }>, selectorFn: (s: QueryOrganizationTokensConnection) => [...Sel]):$Field<"organizationTokens", GetOutput<Sel> | null , GetVariables<Sel, Args>>
organizationTokens<Sel extends Selection<QueryOrganizationTokensConnection>>(selectorFn: (s: QueryOrganizationTokensConnection) => [...Sel]):$Field<"organizationTokens", GetOutput<Sel> | null , GetVariables<Sel>>
organizationTokens(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              after: "String",
before: "String",
expired: "Boolean",
first: "Int",
last: "Int",
orgId: "String"
            },
        args,

        selection: selectorFn(new QueryOrganizationTokensConnection)
      };
      return this.$_select("organizationTokens", options as any) as any
    }
  

      
      pack<Args extends VariabledInput<{
        id?: string | null,
      }>,Sel extends Selection<Pack>>(args: ExactArgNames<Args, {
        id?: string | null,
      }>, selectorFn: (s: Pack) => [...Sel]):$Field<"pack", GetOutput<Sel> | null , GetVariables<Sel, Args>>
pack<Sel extends Selection<Pack>>(selectorFn: (s: Pack) => [...Sel]):$Field<"pack", GetOutput<Sel> | null , GetVariables<Sel>>
pack(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              id: "String"
            },
        args,

        selection: selectorFn(new Pack)
      };
      return this.$_select("pack", options as any) as any
    }
  

      
      packInstance<Args extends VariabledInput<{
        id: string,
      }>,Sel extends Selection<PackInstance>>(args: ExactArgNames<Args, {
        id: string,
      }>, selectorFn: (s: PackInstance) => [...Sel]):$Field<"packInstance", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              id: "String!"
            },
        args,

        selection: selectorFn(new PackInstance)
      };
      return this.$_select("packInstance", options as any) as any
    }
  

      
      packs<Args extends VariabledInput<{
        after?: string | null
before?: string | null
first?: number | null
last?: number | null
private?: boolean | null,
      }>,Sel extends Selection<QueryPacksConnection>>(args: ExactArgNames<Args, {
        after?: string | null
before?: string | null
first?: number | null
last?: number | null
private?: boolean | null,
      }>, selectorFn: (s: QueryPacksConnection) => [...Sel]):$Field<"packs", GetOutput<Sel> | null , GetVariables<Sel, Args>>
packs<Sel extends Selection<QueryPacksConnection>>(selectorFn: (s: QueryPacksConnection) => [...Sel]):$Field<"packs", GetOutput<Sel> | null , GetVariables<Sel>>
packs(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              after: "String",
before: "String",
first: "Int",
last: "Int",
private: "Boolean"
            },
        args,

        selection: selectorFn(new QueryPacksConnection)
      };
      return this.$_select("packs", options as any) as any
    }
  

      
      stripeProduct<Args extends VariabledInput<{
        id: string,
      }>,Sel extends Selection<StripeProduct>>(args: ExactArgNames<Args, {
        id: string,
      }>, selectorFn: (s: StripeProduct) => [...Sel]):$Field<"stripeProduct", GetOutput<Sel> | null , GetVariables<Sel, Args>> {
      
      const options = {
        argTypes: {
              id: "String!"
            },
        args,

        selection: selectorFn(new StripeProduct)
      };
      return this.$_select("stripeProduct", options as any) as any
    }
  

      
      user<Args extends VariabledInput<{
        id?: string | null,
      }>,Sel extends Selection<User>>(args: ExactArgNames<Args, {
        id?: string | null,
      }>, selectorFn: (s: User) => [...Sel]):$Field<"user", GetOutput<Sel> | null , GetVariables<Sel, Args>>
user<Sel extends Selection<User>>(selectorFn: (s: User) => [...Sel]):$Field<"user", GetOutput<Sel> | null , GetVariables<Sel>>
user(arg1: any, arg2?: any) {
      const { args, selectorFn } = !arg2 ? { args: {}, selectorFn: arg1 } : { args: arg1, selectorFn: arg2 };

      const options = {
        argTypes: {
              id: "String"
            },
        args,

        selection: selectorFn(new User)
      };
      return this.$_select("user", options as any) as any
    }
  
}


export class QueryOrganizationTokensConnection extends $Base<"QueryOrganizationTokensConnection"> {
  constructor() {
    super("QueryOrganizationTokensConnection")
  }

  
      
      edges<Sel extends Selection<QueryOrganizationTokensConnectionEdge>>(selectorFn: (s: QueryOrganizationTokensConnectionEdge) => [...Sel]):$Field<"edges", Array<GetOutput<Sel> | null> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new QueryOrganizationTokensConnectionEdge)
      };
      return this.$_select("edges", options as any) as any
    }
  

      
      pageInfo<Sel extends Selection<PageInfo>>(selectorFn: (s: PageInfo) => [...Sel]):$Field<"pageInfo", GetOutput<Sel> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PageInfo)
      };
      return this.$_select("pageInfo", options as any) as any
    }
  
}


export class QueryOrganizationTokensConnectionEdge extends $Base<"QueryOrganizationTokensConnectionEdge"> {
  constructor() {
    super("QueryOrganizationTokensConnectionEdge")
  }

  
      
      get cursor(): $Field<"cursor", string>  {
       return this.$_select("cursor") as any
      }

      
      node<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"node", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("node", options as any) as any
    }
  
}


export class QueryPacksConnection extends $Base<"QueryPacksConnection"> {
  constructor() {
    super("QueryPacksConnection")
  }

  
      
      edges<Sel extends Selection<QueryPacksConnectionEdge>>(selectorFn: (s: QueryPacksConnectionEdge) => [...Sel]):$Field<"edges", Array<GetOutput<Sel> | null> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new QueryPacksConnectionEdge)
      };
      return this.$_select("edges", options as any) as any
    }
  

      
      pageInfo<Sel extends Selection<PageInfo>>(selectorFn: (s: PageInfo) => [...Sel]):$Field<"pageInfo", GetOutput<Sel> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PageInfo)
      };
      return this.$_select("pageInfo", options as any) as any
    }
  
}


export class QueryPacksConnectionEdge extends $Base<"QueryPacksConnectionEdge"> {
  constructor() {
    super("QueryPacksConnectionEdge")
  }

  
      
      get cursor(): $Field<"cursor", string>  {
       return this.$_select("cursor") as any
      }

      
      node<Sel extends Selection<Pack>>(selectorFn: (s: Pack) => [...Sel]):$Field<"node", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new Pack)
      };
      return this.$_select("node", options as any) as any
    }
  
}


/**
 * Remove an instance of a pack
 */
export type RemovePackInstanceInput = {
  id: string
}
    


export class RemovePackInstancePayload extends $Base<"RemovePackInstancePayload"> {
  constructor() {
    super("RemovePackInstancePayload")
  }

  
      
      packInstance<Sel extends Selection<PackInstance>>(selectorFn: (s: PackInstance) => [...Sel]):$Field<"packInstance", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new PackInstance)
      };
      return this.$_select("packInstance", options as any) as any
    }
  
}


/**
 * Create a new organization token, invalidating all existing tokens
 */
export type ResetOrganizationTokenInput = {
  organizationId?: string | null
}
    


export class ResetOrganizationTokenPayload extends $Base<"ResetOrganizationTokenPayload"> {
  constructor() {
    super("ResetOrganizationTokenPayload")
  }

  
      
      replaceOrganizationToken<Sel extends Selection<OrganizationToken>>(selectorFn: (s: OrganizationToken) => [...Sel]):$Field<"replaceOrganizationToken", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new OrganizationToken)
      };
      return this.$_select("replaceOrganizationToken", options as any) as any
    }
  
}


export class SettingValue extends $Union<{AsFloat: AsFloat,AsString: AsString}, "SettingValue"> {
  constructor() {
    super({AsFloat: AsFloat,AsString: AsString}, "SettingValue")
  }
}


export class StripeCheckoutSession extends $Base<"StripeCheckoutSession"> {
  constructor() {
    super("StripeCheckoutSession")
  }

  
      
      get url(): $Field<"url", string>  {
       return this.$_select("url") as any
      }
}


export class StripeProduct extends $Base<"StripeProduct"> {
  constructor() {
    super("StripeProduct")
  }

  
      
      get productName(): $Field<"productName", string | null>  {
       return this.$_select("productName") as any
      }

      
      get stripeProductId(): $Field<"stripeProductId", string | null>  {
       return this.$_select("stripeProductId") as any
      }

      
      tiers<Sel extends Selection<StripeProductTier>>(selectorFn: (s: StripeProductTier) => [...Sel]):$Field<"tiers", Array<GetOutput<Sel>> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new StripeProductTier)
      };
      return this.$_select("tiers", options as any) as any
    }
  

      
      units<Sel extends Selection<StripeProductUnit>>(selectorFn: (s: StripeProductUnit) => [...Sel]):$Field<"units", Array<GetOutput<Sel>> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new StripeProductUnit)
      };
      return this.$_select("units", options as any) as any
    }
  
}


export class StripeProductTier extends $Base<"StripeProductTier"> {
  constructor() {
    super("StripeProductTier")
  }

  
      
      get flatPrice(): $Field<"flatPrice", number | null>  {
       return this.$_select("flatPrice") as any
      }

      
      get perUnitPrice(): $Field<"perUnitPrice", number | null>  {
       return this.$_select("perUnitPrice") as any
      }

      
      get priceId(): $Field<"priceId", string>  {
       return this.$_select("priceId") as any
      }

      
      get upTo(): $Field<"upTo", number | null>  {
       return this.$_select("upTo") as any
      }
}


export class StripeProductUnit extends $Base<"StripeProductUnit"> {
  constructor() {
    super("StripeProductUnit")
  }

  
      
      get flatPrice(): $Field<"flatPrice", number | null>  {
       return this.$_select("flatPrice") as any
      }

      
      get priceId(): $Field<"priceId", string>  {
       return this.$_select("priceId") as any
      }
}


/**
 * Descibes an organization's subscription / plan
 */
export class StripeSubscription extends $Base<"StripeSubscription"> {
  constructor() {
    super("StripeSubscription")
  }

  
      
      get nextDate(): $Field<"nextDate", DateTime | null>  {
       return this.$_select("nextDate") as any
      }

      
      get productId(): $Field<"productId", string | null>  {
       return this.$_select("productId") as any
      }

      
      get productName(): $Field<"productName", string | null>  {
       return this.$_select("productName") as any
      }

      
      get productType(): $Field<"productType", string | null>  {
       return this.$_select("productType") as any
      }

      
      get startDate(): $Field<"startDate", DateTime | null>  {
       return this.$_select("startDate") as any
      }

      
      get status(): $Field<"status", string | null>  {
       return this.$_select("status") as any
      }

      
      get subscriptionId(): $Field<"subscriptionId", string | null>  {
       return this.$_select("subscriptionId") as any
      }

      
      tiers<Sel extends Selection<SubscriptionTieredPrice>>(selectorFn: (s: SubscriptionTieredPrice) => [...Sel]):$Field<"tiers", Array<GetOutput<Sel>> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new SubscriptionTieredPrice)
      };
      return this.$_select("tiers", options as any) as any
    }
  

      
      units<Sel extends Selection<SubscriptionUnitPrice>>(selectorFn: (s: SubscriptionUnitPrice) => [...Sel]):$Field<"units", Array<GetOutput<Sel>> , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new SubscriptionUnitPrice)
      };
      return this.$_select("units", options as any) as any
    }
  
}


export class SubscriptionTieredPrice extends $Base<"SubscriptionTieredPrice"> {
  constructor() {
    super("SubscriptionTieredPrice")
  }

  
      
/**
 * Flat price for the subscription, returned as the smallest unit of currency
 */
      get flatPrice(): $Field<"flatPrice", number | null>  {
       return this.$_select("flatPrice") as any
      }

      
/**
 * Price per unit, returned as the smallest unit of currency
 */
      get perUnitPrice(): $Field<"perUnitPrice", number | null>  {
       return this.$_select("perUnitPrice") as any
      }

      
      get priceId(): $Field<"priceId", string>  {
       return this.$_select("priceId") as any
      }

      
      get upTo(): $Field<"upTo", number | null>  {
       return this.$_select("upTo") as any
      }
}


export class SubscriptionUnitPrice extends $Base<"SubscriptionUnitPrice"> {
  constructor() {
    super("SubscriptionUnitPrice")
  }

  
      
/**
 * Flat price for the subscription, returned as the smallest unit of currency
 */
      get flatPrice(): $Field<"flatPrice", number | null>  {
       return this.$_select("flatPrice") as any
      }

      
      get priceId(): $Field<"priceId", string>  {
       return this.$_select("priceId") as any
      }
}


export class UploadPackResponse extends $Base<"UploadPackResponse"> {
  constructor() {
    super("UploadPackResponse")
  }

  
      
/**
 * The URL to upload the manifest file
 */
      get manifestUrl(): $Field<"manifestUrl", string>  {
       return this.$_select("manifestUrl") as any
      }

      
/**
 * The URL to upload the pack file
 */
      get packUrl(): $Field<"packUrl", string>  {
       return this.$_select("packUrl") as any
      }

      
/**
 * A JWT ticket to confirm the upload on completion
 */
      get ticket(): $Field<"ticket", string>  {
       return this.$_select("ticket") as any
      }
}


/**
 * A Taskless user
 */
export class User extends $Base<"User"> {
  constructor() {
    super("User")
  }

  
      
      clerk<Sel extends Selection<ClerkUser>>(selectorFn: (s: ClerkUser) => [...Sel]):$Field<"clerk", GetOutput<Sel> | null , GetVariables<Sel>> {
      
      const options = {
        
        

        selection: selectorFn(new ClerkUser)
      };
      return this.$_select("clerk", options as any) as any
    }
  

      
      get clerkId(): $Field<"clerkId", string | null>  {
       return this.$_select("clerkId") as any
      }

      
      get createdAt(): $Field<"createdAt", DateTime | null>  {
       return this.$_select("createdAt") as any
      }

      
      get id(): $Field<"id", string>  {
       return this.$_select("id") as any
      }

      
/**
 * The id for this record, unique to this object type
 */
      get localId(): $Field<"localId", string | null>  {
       return this.$_select("localId") as any
      }

      
      get updatedAt(): $Field<"updatedAt", DateTime | null>  {
       return this.$_select("updatedAt") as any
      }
}

  const $Root = {
    query: Query,
mutation: Mutation
  }

  namespace $RootTypes {
    export type query = Query
export type mutation = Mutation
  }
  

export function query<Sel extends Selection<$RootTypes.query>>(
  name: string,
  selectFn: (q: $RootTypes.query) => [...Sel]
): TypedDocumentNode<GetOutput<Sel>, GetVariables<Sel>>
export function query<Sel extends Selection<$RootTypes.query>>(
  selectFn: (q: $RootTypes.query) => [...Sel]
): TypedDocumentNode<GetOutput<Sel>, Simplify<GetVariables<Sel>>>
export function query<Sel extends Selection<$RootTypes.query>>(name: any, selectFn?: any) {
  if (!selectFn) {
    selectFn = name
    name = ''
  }
  let field = new $Field<'query', GetOutput<Sel>, GetVariables<Sel>>('query', {
    selection: selectFn(new $Root.query()),
  })
  const str = fieldToQuery(`query ${name}`, field)

  return gql(str) as any
}


export function mutation<Sel extends Selection<$RootTypes.mutation>>(
  name: string,
  selectFn: (q: $RootTypes.mutation) => [...Sel]
): TypedDocumentNode<GetOutput<Sel>, GetVariables<Sel>>
export function mutation<Sel extends Selection<$RootTypes.mutation>>(
  selectFn: (q: $RootTypes.mutation) => [...Sel]
): TypedDocumentNode<GetOutput<Sel>, Simplify<GetVariables<Sel>>>
export function mutation<Sel extends Selection<$RootTypes.query>>(name: any, selectFn?: any) {
  if (!selectFn) {
    selectFn = name
    name = ''
  }
  let field = new $Field<'mutation', GetOutput<Sel>, GetVariables<Sel>>('mutation', {
    selection: selectFn(new $Root.mutation()),
  })
  const str = fieldToQuery(`mutation ${name}`, field)

  return gql(str) as any
}


const $InputTypes: {[key: string]: {[key: string]: string}} = {
    AddPackInstanceInput: {
    description: "String",
organizationId: "String",
packId: "String!"
  },
  ChangePackConfigurationInput: {
    configuration: "String",
description: "String",
enabled: "Boolean",
id: "String!"
  },
  CreateOrganizationTokenInput: {
    description: "String",
organizationId: "String"
  },
  DeleteOrganizationTokenInput: {
    id: "String!"
  },
  MetricAggregateArgument: {
    avg: "String",
count: "String",
p95: "String",
p99: "String",
sum: "String"
  },
  MetricBucketArgument: {
    dimension: "String",
time: "MetricBucketTimeEnum"
  },
  MetricTimeArgument: {
    end: "DateTime",
start: "DateTime"
  },
  RemovePackInstanceInput: {
    id: "String!"
  },
  ResetOrganizationTokenInput: {
    organizationId: "String"
  }
}

